/// <reference types="jest" />
import { UnauthorizedException } from '@nestjs/common';

import { accountNumberFor } from '../src/account/account.service';
import { TradingEngineController } from '../src/trading-engine/trading-engine.controller';

describe('TradingEngineController user binding', () => {
  const service = {
    placeTrade: jest.fn(async (dto) => dto),
    getWallet: jest.fn(async (...args) => args),
    getOpenTrades: jest.fn(async (userId) => userId),
    settleTradeForUser: jest.fn(async (...args) => args),
  };
  const controller = new TradingEngineController(service as any);
  const signedIn = { user: { id: 'user-123' } } as any;
  const guest = {} as any;

  beforeEach(() => jest.clearAllMocks());

  it('ignores a userId sent by a signed-in client', async () => {
    await controller.placeTrade(signedIn, { userId: 'someone-else', asset: 'EUR/USD OTC' } as any);
    expect(service.placeTrade).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-123' }));
  });

  it('puts guests on the shared demo account', async () => {
    await controller.placeTrade(guest, { userId: 'user-123', asset: 'EUR/USD OTC', accountType: 'QT Demo' } as any);
    expect(service.placeTrade).toHaveBeenCalledWith(expect.objectContaining({ userId: 'demo-user' }));
    expect(await controller.getOpenTrades(guest)).toBe('demo-user');
  });

  it('requires sign-in for the real account', () => {
    expect(() => controller.placeTrade(guest, { asset: 'EUR/USD OTC', accountType: 'QT Real' } as any)).toThrow(
      UnauthorizedException,
    );
    expect(() => controller.getWallet(guest, 'QT Real', 'USD')).toThrow(UnauthorizedException);
  });

  it('settles only for the caller', async () => {
    await controller.settleTrade(signedIn, 'trade-1');
    expect(service.settleTradeForUser).toHaveBeenCalledWith('trade-1', 'user-123');
  });
});

describe('accountNumberFor', () => {
  it('is stable and formatted like N0000000', () => {
    const value = accountNumberFor('8c1f0a8e-1111-2222-3333-444455556666');
    expect(value).toMatch(/^N\d{7}$/);
    expect(accountNumberFor('8c1f0a8e-1111-2222-3333-444455556666')).toBe(value);
  });
});
