/// <reference types="jest" />
import { TransactionStatus } from '@prisma/client';

import { MpesaService } from '../src/payments/mpesa.service';

type FetchCall = { url: string; body: Record<string, unknown> | null; headers: Record<string, string> };

function mockFetch(responses: Record<string, unknown>) {
  const calls: FetchCall[] = [];
  const fn = jest.fn(async (url: string, init: RequestInit) => {
    calls.push({
      url,
      body: init.body ? JSON.parse(String(init.body)) : null,
      headers: (init.headers || {}) as Record<string, string>,
    });
    const key = Object.keys(responses).find((k) => url.includes(k));
    const payload = key ? responses[key] : {};
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify(payload),
    } as unknown as Response;
  });
  global.fetch = fn as unknown as typeof fetch;
  return calls;
}

function makeService(depositOverrides: Partial<Record<string, unknown>> = {}) {
  const deposit = {
    id: 'dep-1',
    userId: 'user-1',
    status: TransactionStatus.PENDING,
    amount: 100,
    currency: 'KES',
    phone: '254712345678',
    checkoutId: 'ws_CO_1',
    externalRef: null,
    gatewayRaw: null,
    createdAt: new Date(),
    ...depositOverrides,
  };

  const prisma = {
    wallet: { upsert: jest.fn(async () => ({ id: 'wallet-1' })) },
    paymentGateway: { upsert: jest.fn(async () => ({ id: 'gw-1', isActive: true })) },
    deposit: {
      update: jest.fn(async () => deposit),
      updateMany: jest.fn(async () => ({ count: deposit.status === TransactionStatus.PENDING ? 1 : 0 })),
      findFirst: jest.fn(async () => deposit),
      findUnique: jest.fn(async () => deposit),
    },
  };

  const depositsService = {
    create: jest.fn(async () => ({ id: 'dep-1' })),
    markCompleted: jest.fn(async () => ({})),
    markFailed: jest.fn(async () => ({})),
  };

  const service = new MpesaService(prisma as never, depositsService as never);
  return { service, prisma, depositsService };
}

describe('MpesaService', () => {
  const env = { ...process.env };

  beforeEach(() => {
    process.env = {
      ...env,
      MPESA_ENV: 'sandbox',
      MPESA_CONSUMER_KEY: 'key',
      MPESA_CONSUMER_SECRET: 'secret',
      JWT_SECRET: 'test-secret',
      BACKEND_PUBLIC_URL: 'https://api.example.com',
    };
  });

  afterAll(() => {
    process.env = env;
  });

  it('normalises Kenyan phone numbers and rejects invalid ones', () => {
    const { service } = makeService();
    expect(service.normalizePhone('0712 345 678')).toBe('254712345678');
    expect(service.normalizePhone('+254 712 345 678')).toBe('254712345678');
    expect(service.normalizePhone('0110345678')).toBe('254110345678');
    expect(service.normalizePhone('712345678')).toBe('254712345678');
    expect(() => service.normalizePhone('0812345678')).toThrow();
    expect(() => service.normalizePhone('12345')).toThrow();
  });

  it('sends a correctly formed STK push and stores the checkout id', async () => {
    const calls = mockFetch({
      '/oauth/v1/generate': { access_token: 'tok', expires_in: '3599' },
      '/stkpush/v1/processrequest': {
        MerchantRequestID: 'm-1',
        CheckoutRequestID: 'ws_CO_1',
        ResponseCode: '0',
        CustomerMessage: 'Success. Request accepted for processing',
      },
    });
    const { service, prisma, depositsService } = makeService();

    const result = await service.startDeposit('user-1', '0712345678', 100.4);

    expect(depositsService.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1', amount: 100, currency: 'KES', phone: '254712345678' }),
    );
    const push = calls.find((c) => c.url.includes('processrequest'))!;
    expect(push.headers.Authorization).toBe('Bearer tok');
    expect(push.body).toMatchObject({
      BusinessShortCode: '174379',
      TransactionType: 'CustomerPayBillOnline',
      Amount: 100,
      PartyA: '254712345678',
      PartyB: '174379',
      PhoneNumber: '254712345678',
    });
    expect(String(push.body!.Timestamp)).toMatch(/^\d{14}$/);
    const decoded = Buffer.from(String(push.body!.Password), 'base64').toString();
    expect(decoded.startsWith('174379')).toBe(true);
    expect(decoded.endsWith(String(push.body!.Timestamp))).toBe(true);
    const callbackUrl = String(push.body!.CallBackURL);
    expect(callbackUrl.startsWith('https://api.example.com/payments/stk/callback/')).toBe(true);
    expect(callbackUrl.toLowerCase()).not.toContain('mpesa');
    expect(prisma.deposit.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ checkoutId: 'ws_CO_1' }) }),
    );
    expect(result).toMatchObject({ depositId: 'dep-1', status: 'PENDING', amount: 100 });
  });

  it('marks the deposit failed when Daraja rejects the push', async () => {
    mockFetch({
      '/oauth/v1/generate': { access_token: 'tok', expires_in: '3599' },
      '/stkpush/v1/processrequest': { errorCode: '400.002.02', errorMessage: 'Bad Request - Invalid PhoneNumber' },
    });
    const { service, depositsService } = makeService();

    await expect(service.startDeposit('user-1', '0712345678', 50)).rejects.toThrow(/Invalid PhoneNumber/);
    expect(depositsService.markFailed).toHaveBeenCalledWith('dep-1', expect.stringContaining('Invalid PhoneNumber'));
  });

  it('credits the deposit only after Daraja confirms the payment', async () => {
    mockFetch({
      '/oauth/v1/generate': { access_token: 'tok', expires_in: '3599' },
      '/stkpushquery/v1/query': { ResponseCode: '0', ResultCode: '0', ResultDesc: 'Processed successfully' },
    });
    const { service, depositsService } = makeService();

    await service.handleCallback({
      Body: {
        stkCallback: {
          CheckoutRequestID: 'ws_CO_1',
          ResultCode: 0,
          ResultDesc: 'The service request is processed successfully.',
          CallbackMetadata: {
            Item: [
              { Name: 'Amount', Value: 100 },
              { Name: 'MpesaReceiptNumber', Value: 'SJK1ABCD23' },
            ],
          },
        },
      },
    });

    expect(depositsService.markCompleted).toHaveBeenCalledWith('dep-1', 'SJK1ABCD23');
  });

  it('does not credit a forged success callback that Daraja does not confirm', async () => {
    mockFetch({
      '/oauth/v1/generate': { access_token: 'tok', expires_in: '3599' },
      '/stkpushquery/v1/query': { ResponseCode: '0', ResultCode: '1032', ResultDesc: 'Request cancelled by user' },
    });
    const { service, depositsService } = makeService();

    await service.handleCallback({
      Body: {
        stkCallback: {
          CheckoutRequestID: 'ws_CO_1',
          ResultCode: 0,
          CallbackMetadata: { Item: [{ Name: 'Amount', Value: 100 }, { Name: 'MpesaReceiptNumber', Value: 'FAKE' }] },
        },
      },
    });

    expect(depositsService.markCompleted).not.toHaveBeenCalled();
  });

  it('marks the deposit failed when the customer cancels', async () => {
    mockFetch({});
    const { service, depositsService } = makeService();

    await service.handleCallback({
      Body: { stkCallback: { CheckoutRequestID: 'ws_CO_1', ResultCode: 1032, ResultDesc: 'Request cancelled by user' } },
    });

    expect(depositsService.markFailed).toHaveBeenCalledWith('dep-1', 'Request cancelled by user');
    expect(depositsService.markCompleted).not.toHaveBeenCalled();
  });

  it('refuses to start a deposit when M-Pesa is not configured', async () => {
    delete process.env.MPESA_CONSUMER_KEY;
    const { service } = makeService();
    await expect(service.startDeposit('user-1', '0712345678', 100)).rejects.toThrow(/not set up/);
  });
});
