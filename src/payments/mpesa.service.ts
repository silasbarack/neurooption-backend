import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  PaymentDirection,
  PaymentGatewayType,
  TransactionStatus,
} from '@prisma/client';
import { createHash } from 'crypto';

import { PrismaService } from '../config/prisma.service';
import { DepositsService } from '../deposits/deposits.service';

// Safaricom's public sandbox Lipa na M-Pesa shortcode and passkey
// (published in the Daraja docs). Production values must come from env.
const SANDBOX_SHORTCODE = '174379';
const SANDBOX_PASSKEY =
  'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';

const DARAJA_TIMEOUT_MS = 20_000;
// Give the customer time to enter their PIN before asking Safaricom.
const QUERY_AFTER_MS = 15_000;
const MAX_STK_AMOUNT = 150_000;
const DEPOSIT_CURRENCY = 'KES';

type StkPushResponse = {
  MerchantRequestID?: string;
  CheckoutRequestID?: string;
  ResponseCode?: string;
  ResponseDescription?: string;
  CustomerMessage?: string;
  errorCode?: string;
  errorMessage?: string;
};

type StkQueryResponse = {
  ResponseCode?: string;
  ResultCode?: string | number;
  ResultDesc?: string;
  errorCode?: string;
  errorMessage?: string;
};

type CallbackItem = { Name: string; Value?: string | number };

export type StkCallbackBody = {
  Body?: {
    stkCallback?: {
      MerchantRequestID?: string;
      CheckoutRequestID?: string;
      ResultCode?: number | string;
      ResultDesc?: string;
      CallbackMetadata?: { Item?: CallbackItem[] };
    };
  };
};

type QueryOutcome = 'paid' | 'failed' | 'pending' | 'unknown';

@Injectable()
export class MpesaService {
  private readonly logger = new Logger(MpesaService.name);
  private token: { value: string; expiresAt: number } | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly depositsService: DepositsService,
  ) {}

  // ---------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------

  private env(name: string): string {
    return (process.env[name] || '').trim();
  }

  private get environment(): 'sandbox' | 'production' {
    return this.env('MPESA_ENV').toLowerCase() === 'production'
      ? 'production'
      : 'sandbox';
  }

  private get baseUrl(): string {
    return this.environment === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
  }

  private get shortcode(): string {
    return (
      this.env('MPESA_SHORTCODE') ||
      (this.environment === 'sandbox' ? SANDBOX_SHORTCODE : '')
    );
  }

  private get passkey(): string {
    return (
      this.env('MPESA_PASSKEY') ||
      (this.environment === 'sandbox' ? SANDBOX_PASSKEY : '')
    );
  }

  private get transactionType(): string {
    return this.env('MPESA_TRANSACTION_TYPE') === 'CustomerBuyGoodsOnline'
      ? 'CustomerBuyGoodsOnline'
      : 'CustomerPayBillOnline';
  }

  /** Paybill: the shortcode itself. Till (Buy Goods): the till number. */
  private get partyB(): string {
    return this.env('MPESA_PARTY_B') || this.shortcode;
  }

  /**
   * Secret path segment for the callback URL. Safaricom does not sign
   * callbacks, so an unguessable URL plus a confirmation query to Daraja
   * before crediting protects against forged notifications.
   */
  get callbackToken(): string {
    return (
      this.env('MPESA_CALLBACK_TOKEN') ||
      createHash('sha256')
        .update(`${process.env.JWT_SECRET || 'dev_secret'}:stk-callback`)
        .digest('hex')
        .slice(0, 32)
    );
  }

  private get callbackUrl(): string {
    // Safaricom rejects callback URLs containing words like "mpesa", so the
    // route is /payments/stk/callback/:token.
    const base = (
      this.env('BACKEND_PUBLIC_URL') || 'https://neurooption-backend.onrender.com'
    ).replace(/\/+$/, '');
    return `${base}/payments/stk/callback/${this.callbackToken}`;
  }

  isConfigured(): boolean {
    return Boolean(
      this.env('MPESA_CONSUMER_KEY') &&
        this.env('MPESA_CONSUMER_SECRET') &&
        this.shortcode &&
        this.passkey,
    );
  }

  configSummary() {
    return {
      configured: this.isConfigured(),
      environment: this.environment,
      shortcode: this.shortcode || null,
      transactionType: this.transactionType,
      minAmount: this.minAmount,
      maxAmount: MAX_STK_AMOUNT,
    };
  }

  private get minAmount(): number {
    const value = Number(this.env('MPESA_MIN_AMOUNT') || 1);
    return Number.isFinite(value) && value >= 1 ? Math.floor(value) : 1;
  }

  // ---------------------------------------------------------------------
  // Daraja API
  // ---------------------------------------------------------------------

  private async fetchJson<T>(
    url: string,
    init: RequestInit,
  ): Promise<{ ok: boolean; status: number; body: T }> {
    const response = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(DARAJA_TIMEOUT_MS),
    });
    const text = await response.text();
    let body: T;
    try {
      body = (text ? JSON.parse(text) : {}) as T;
    } catch {
      body = { errorMessage: text.slice(0, 300) } as unknown as T;
    }
    return { ok: response.ok, status: response.status, body };
  }

  private async getAccessToken(): Promise<string> {
    if (this.token && this.token.expiresAt > Date.now() + 60_000) {
      return this.token.value;
    }

    const credentials = Buffer.from(
      `${this.env('MPESA_CONSUMER_KEY')}:${this.env('MPESA_CONSUMER_SECRET')}`,
    ).toString('base64');

    const { ok, status, body } = await this.fetchJson<{
      access_token?: string;
      expires_in?: string | number;
      errorMessage?: string;
    }>(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      method: 'GET',
      headers: { Authorization: `Basic ${credentials}` },
    });

    if (!ok || !body.access_token) {
      this.logger.error(
        `Daraja OAuth failed (HTTP ${status}): ${body.errorMessage || 'no access token'}`,
      );
      throw new BadGatewayException(
        'Could not connect to M-Pesa. Please try again shortly.',
      );
    }

    const ttlSeconds = Number(body.expires_in) || 3599;
    this.token = {
      value: body.access_token,
      expiresAt: Date.now() + ttlSeconds * 1000,
    };
    return this.token.value;
  }

  /** Daraja expects the timestamp in Kenyan time (EAT, UTC+3). */
  private timestamp(date = new Date()): string {
    const eat = new Date(date.getTime() + 3 * 60 * 60 * 1000);
    return eat.toISOString().replace(/[-:T]/g, '').slice(0, 14);
  }

  private password(timestamp: string): string {
    return Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString(
      'base64',
    );
  }

  /** Accepts 07.., 01.., +2547.., 2547.. and returns 2547XXXXXXXX. */
  normalizePhone(input: string): string {
    const digits = String(input || '').replace(/\D/g, '');
    let phone = digits;
    if (/^0[17]\d{8}$/.test(digits)) phone = `254${digits.slice(1)}`;
    else if (/^[17]\d{8}$/.test(digits)) phone = `254${digits}`;

    if (!/^254[17]\d{8}$/.test(phone)) {
      throw new BadRequestException(
        'Enter a valid Safaricom number, e.g. 0712 345 678.',
      );
    }
    return phone;
  }

  private async queryStk(checkoutRequestId: string): Promise<{
    outcome: QueryOutcome;
    resultCode?: string;
    resultDesc?: string;
  }> {
    try {
      const token = await this.getAccessToken();
      const timestamp = this.timestamp();
      const { body } = await this.fetchJson<StkQueryResponse>(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            BusinessShortCode: this.shortcode,
            Password: this.password(timestamp),
            Timestamp: timestamp,
            CheckoutRequestID: checkoutRequestId,
          }),
        },
      );

      if (body.ResultCode !== undefined && body.ResultCode !== null) {
        const code = String(body.ResultCode);
        return {
          outcome: code === '0' ? 'paid' : 'failed',
          resultCode: code,
          resultDesc: body.ResultDesc,
        };
      }

      // "The transaction is being processed" while the prompt is open.
      if (body.errorCode === '500.001.1001') {
        return { outcome: 'pending', resultDesc: body.errorMessage };
      }

      return { outcome: 'unknown', resultDesc: body.errorMessage };
    } catch (error) {
      this.logger.warn(
        `STK query failed for ${checkoutRequestId}: ${error instanceof Error ? error.message : error}`,
      );
      return { outcome: 'unknown' };
    }
  }

  // ---------------------------------------------------------------------
  // Deposits
  // ---------------------------------------------------------------------

  private async ensureDepositSetup(userId: string) {
    const wallet = await this.prisma.wallet.upsert({
      where: { userId_currency: { userId, currency: DEPOSIT_CURRENCY } },
      update: {},
      create: { userId, currency: DEPOSIT_CURRENCY },
    });

    const gateway = await this.prisma.paymentGateway.upsert({
      where: {
        type_direction: {
          type: PaymentGatewayType.MPESA,
          direction: PaymentDirection.IN,
        },
      },
      update: {},
      create: {
        name: 'M-Pesa',
        type: PaymentGatewayType.MPESA,
        direction: PaymentDirection.IN,
        environment: this.environment,
        shortcode: this.shortcode,
        callbackUrl: this.callbackUrl,
      },
    });

    if (!gateway.isActive) {
      throw new ServiceUnavailableException(
        'M-Pesa deposits are temporarily unavailable.',
      );
    }

    return wallet;
  }

  async startDeposit(userId: string, phoneInput: string, amountInput: number) {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException(
        'M-Pesa deposits are not set up yet. Please try again later.',
      );
    }

    const phone = this.normalizePhone(phoneInput);
    const amount = Math.round(Number(amountInput));

    if (!Number.isFinite(amount) || amount < this.minAmount) {
      throw new BadRequestException(
        `The minimum M-Pesa deposit is KES ${this.minAmount}.`,
      );
    }
    if (amount > MAX_STK_AMOUNT) {
      throw new BadRequestException(
        `The maximum M-Pesa deposit is KES ${MAX_STK_AMOUNT.toLocaleString('en-KE')}.`,
      );
    }

    const wallet = await this.ensureDepositSetup(userId);

    const deposit = await this.depositsService.create({
      userId,
      walletId: wallet.id,
      gatewayType: PaymentGatewayType.MPESA,
      amount,
      currency: DEPOSIT_CURRENCY,
      phone,
    });

    const timestamp = this.timestamp();
    let response: StkPushResponse;

    try {
      const token = await this.getAccessToken();
      const result = await this.fetchJson<StkPushResponse>(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            BusinessShortCode: this.shortcode,
            Password: this.password(timestamp),
            Timestamp: timestamp,
            TransactionType: this.transactionType,
            Amount: amount,
            PartyA: phone,
            PartyB: this.partyB,
            PhoneNumber: phone,
            CallBackURL: this.callbackUrl,
            AccountReference: (this.env('MPESA_ACCOUNT_REFERENCE') || 'NeuroOption').slice(0, 12),
            TransactionDesc: 'Deposit',
          }),
        },
      );
      response = result.body;
    } catch (error) {
      await this.failDeposit(deposit.id, 'Could not reach M-Pesa');
      throw error instanceof BadGatewayException
        ? error
        : new BadGatewayException('Could not reach M-Pesa. Please try again.');
    }

    if (response.ResponseCode !== '0' || !response.CheckoutRequestID) {
      const reason =
        response.errorMessage || response.ResponseDescription || 'STK push rejected';
      this.logger.warn(`STK push rejected for deposit ${deposit.id}: ${reason}`);
      await this.failDeposit(deposit.id, reason);
      throw new BadRequestException(`M-Pesa could not start the payment: ${reason}`);
    }

    await this.prisma.deposit.update({
      where: { id: deposit.id },
      data: {
        checkoutId: response.CheckoutRequestID,
        gatewayRaw: { stkPush: response } as object,
      },
    });

    this.logger.log(
      `STK push sent for deposit ${deposit.id} (KES ${amount} to ${phone.slice(0, 6)}***)`,
    );

    return {
      depositId: deposit.id,
      status: TransactionStatus.PENDING,
      amount,
      currency: DEPOSIT_CURRENCY,
      phone,
      message:
        response.CustomerMessage ||
        'Check your phone and enter your M-Pesa PIN to complete the deposit.',
    };
  }

  async getDepositStatus(userId: string, depositId: string) {
    let deposit = await this.prisma.deposit.findUnique({
      where: { id: depositId },
    });

    if (!deposit) throw new NotFoundException('Deposit not found');
    if (deposit.userId !== userId) throw new ForbiddenException();

    // If Safaricom's callback hasn't arrived, ask Daraja directly.
    if (
      deposit.status === TransactionStatus.PENDING &&
      deposit.checkoutId &&
      Date.now() - deposit.createdAt.getTime() > QUERY_AFTER_MS
    ) {
      const query = await this.queryStk(deposit.checkoutId);
      if (query.outcome === 'paid') {
        await this.completeDeposit(deposit.id, deposit.checkoutId);
      } else if (query.outcome === 'failed') {
        await this.failDeposit(deposit.id, query.resultDesc || 'Payment not completed');
      }
      deposit = await this.prisma.deposit.findUnique({ where: { id: depositId } });
    }

    return this.toStatus(deposit!);
  }

  async handleCallback(body: StkCallbackBody) {
    const callback = body?.Body?.stkCallback;
    const checkoutId = callback?.CheckoutRequestID;
    if (!checkoutId) return;

    const deposit = await this.prisma.deposit.findFirst({
      where: { checkoutId },
    });

    if (!deposit) {
      this.logger.warn(`STK callback for unknown checkout ${checkoutId}`);
      return;
    }

    const items = callback.CallbackMetadata?.Item ?? [];
    const item = (name: string) => items.find((i) => i.Name === name)?.Value;
    const receipt = item('MpesaReceiptNumber');
    const paidAmount = Number(item('Amount'));

    await this.prisma.deposit.update({
      where: { id: deposit.id },
      data: {
        gatewayRaw: {
          ...((deposit.gatewayRaw as object) || {}),
          callback,
        } as object,
      },
    });

    if (deposit.status !== TransactionStatus.PENDING) return;

    if (String(callback.ResultCode) !== '0') {
      await this.failDeposit(deposit.id, callback.ResultDesc || 'Payment not completed');
      return;
    }

    // Never trust the callback alone: confirm with Daraja before crediting.
    const query = await this.queryStk(checkoutId);
    if (query.outcome !== 'paid') {
      this.logger.warn(
        `Callback for deposit ${deposit.id} reported success but query returned ${query.outcome}; leaving pending.`,
      );
      return;
    }

    if (Number.isFinite(paidAmount) && paidAmount !== Number(deposit.amount)) {
      this.logger.error(
        `Deposit ${deposit.id} amount mismatch: expected ${deposit.amount}, paid ${paidAmount}. Needs manual review.`,
      );
      await this.failDeposit(deposit.id, 'Amount mismatch, under review');
      return;
    }

    await this.completeDeposit(deposit.id, receipt ? String(receipt) : checkoutId);
  }

  /**
   * Claims the PENDING deposit (so a callback and a status poll can't both
   * credit it) and then completes it through DepositsService, which credits
   * the wallet and posts to the ledger.
   */
  private async completeDeposit(depositId: string, externalRef: string) {
    const claim = await this.prisma.deposit.updateMany({
      where: { id: depositId, status: TransactionStatus.PENDING },
      data: { status: TransactionStatus.PROCESSING },
    });
    if (claim.count === 0) return;

    try {
      await this.depositsService.markCompleted(depositId, externalRef);
      this.logger.log(`Deposit ${depositId} completed (${externalRef}).`);
    } catch (error) {
      this.logger.error(
        `Crediting deposit ${depositId} failed: ${error instanceof Error ? error.message : error}`,
      );
      await this.prisma.deposit.update({
        where: { id: depositId },
        data: { status: TransactionStatus.PENDING },
      });
      throw error;
    }
  }

  private async failDeposit(depositId: string, reason: string) {
    const claim = await this.prisma.deposit.updateMany({
      where: { id: depositId, status: TransactionStatus.PENDING },
      data: { status: TransactionStatus.PROCESSING },
    });
    if (claim.count === 0) return;

    await this.depositsService.markFailed(depositId, reason.slice(0, 180));
  }

  private toStatus(deposit: {
    id: string;
    status: TransactionStatus;
    amount: unknown;
    currency: string;
    phone: string | null;
    externalRef: string | null;
  }) {
    const messages: Partial<Record<TransactionStatus, string>> = {
      PENDING: 'Waiting for you to enter your M-Pesa PIN…',
      PROCESSING: 'Confirming your payment…',
      COMPLETED: 'Deposit received. Your balance has been updated.',
      FAILED: deposit.externalRef || 'The payment was not completed.',
      CANCELLED: 'The payment was cancelled.',
    };

    return {
      depositId: deposit.id,
      status: deposit.status,
      amount: Number(deposit.amount),
      currency: deposit.currency,
      phone: deposit.phone,
      receipt:
        deposit.status === TransactionStatus.COMPLETED ? deposit.externalRef : null,
      message: messages[deposit.status] || '',
    };
  }
}
