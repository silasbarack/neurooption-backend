/// <reference types="jest" />
import { ServiceUnavailableException } from '@nestjs/common';

import {
  assertAccountTypeAllowed,
  realMoneyEnabled,
  requireRealMoneyAuthorization,
} from '../src/common/real-money-mode';

describe('real-money mode', () => {
  const original = process.env.REAL_MONEY_DISABLED;

  afterEach(() => {
    if (original === undefined) delete process.env.REAL_MONEY_DISABLED;
    else process.env.REAL_MONEY_DISABLED = original;
  });

  it('is on unless REAL_MONEY_DISABLED is true', () => {
    delete process.env.REAL_MONEY_DISABLED;
    expect(realMoneyEnabled()).toBe(true);
    expect(() => requireRealMoneyAuthorization()).not.toThrow();
    expect(() => assertAccountTypeAllowed('QT Real')).not.toThrow();

    process.env.REAL_MONEY_DISABLED = 'false';
    expect(realMoneyEnabled()).toBe(true);
  });

  it('blocks real-money flows but not demo trading when switched off', () => {
    process.env.REAL_MONEY_DISABLED = ' TRUE ';
    expect(realMoneyEnabled()).toBe(false);
    expect(() => requireRealMoneyAuthorization()).toThrow(ServiceUnavailableException);
    expect(() => assertAccountTypeAllowed('QT Real')).toThrow(ServiceUnavailableException);
    expect(() => assertAccountTypeAllowed('QT Demo')).not.toThrow();
  });
});

describe('money endpoints', () => {
  afterEach(() => {
    delete process.env.REAL_MONEY_DISABLED;
  });

  it('start an M-Pesa deposit and request a withdrawal for the signed-in user', async () => {
    const { MpesaController } = await import('../src/payments/mpesa.controller');
    const { FinanceController } = await import('../src/payments/finance.controller');
    const mpesa = { startDeposit: jest.fn(async () => ({ depositId: 'dep-1' })) };
    const finance = { requestWithdrawal: jest.fn(async () => ({ id: 'wd-1' })) };
    const req = { user: { id: 'user-1' } } as never;

    await expect(
      new MpesaController(mpesa as never).startDeposit(req, { phone: '0712345678', amount: 100 } as never),
    ).resolves.toEqual({ depositId: 'dep-1' });
    expect(mpesa.startDeposit).toHaveBeenCalledWith('user-1', '0712345678', 100);

    await expect(
      new FinanceController(finance as never).requestWithdrawal(req, { phone: '0712345678', amount: 50 } as never),
    ).resolves.toEqual({ id: 'wd-1' });
    expect(finance.requestWithdrawal).toHaveBeenCalledWith('user-1', '0712345678', 50);
  });

  it('refuse both when real money is switched off', async () => {
    process.env.REAL_MONEY_DISABLED = 'true';
    const { MpesaController } = await import('../src/payments/mpesa.controller');
    const { FinanceController } = await import('../src/payments/finance.controller');
    const mpesa = { startDeposit: jest.fn() };
    const finance = { requestWithdrawal: jest.fn() };
    const req = { user: { id: 'user-1' } } as never;

    expect(() => new MpesaController(mpesa as never).startDeposit(req, { phone: '0712345678', amount: 100 } as never)).toThrow(
      ServiceUnavailableException,
    );
    expect(() => new FinanceController(finance as never).requestWithdrawal(req, { phone: '0712345678', amount: 50 } as never)).toThrow(
      ServiceUnavailableException,
    );
    expect(mpesa.startDeposit).not.toHaveBeenCalled();
    expect(finance.requestWithdrawal).not.toHaveBeenCalled();
  });
});
