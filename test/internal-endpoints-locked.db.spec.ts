/// <reference types="jest" />
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';

import { JwtStrategy } from '../src/auth/jwt.strategy';
import { AffiliatesModule } from '../src/affiliates/affiliates.module';
import { CandlesModule } from '../src/candles/candles.module';
import { DemoAccountsModule } from '../src/demo-accounts/demo-accounts.module';
import { ExpiriesModule } from '../src/expiries/expiries.module';
import { OtcMarketsModule } from '../src/otc-markets/otc-markets.module';
import { PaymentGatewaysModule } from '../src/payment-gateways/payment-gateways.module';
import { PayoutsModule } from '../src/payouts/payouts.module';
import { RealMarketsModule } from '../src/real-markets/real-markets.module';
import { TimeframesModule } from '../src/timeframes/timeframes.module';
import { TradingAccountsModule } from '../src/trading-accounts/trading-accounts.module';
import { AuditLogsModule } from '../src/audit-logs/audit-logs.module';
import { getJwtSecret } from '../src/config/jwt.config';
import { PrismaModule } from '../src/config/prisma.module';
import { NotificationsModule } from '../src/notifications/notifications.module';
import { SocialTradingModule } from '../src/social-trading/social-trading.module';

/**
 * These internal endpoints are not used by the client app. They exposed
 * personal data (and could credit wallets) without any sign-in; they must
 * now require a Super Administrator session.
 */
const describeDb = process.env.DATABASE_URL ? describe : describe.skip;

describeDb('internal endpoints require a Super Administrator', () => {
  const prisma = new PrismaClient();
  const tag = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const jwt = new JwtService({ secret: getJwtSecret() });
  let app: INestApplication;
  let superToken: string;
  let supportToken: string;
  let clientToken: string;
  let clientId: string;

  const adminToken = (id: string) =>
    jwt.sign({ sub: id, purpose: 'admin-dashboard' }, { expiresIn: '5m', issuer: 'neurooption-admin', audience: 'neurooption-admin-dashboard' });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        PrismaModule, AuditLogsModule, NotificationsModule, AffiliatesModule, SocialTradingModule,
        PayoutsModule, PaymentGatewaysModule, ExpiriesModule, OtcMarketsModule, RealMarketsModule, TimeframesModule,
        CandlesModule, TradingAccountsModule, DemoAccountsModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
      ],
      providers: [JwtStrategy],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    const hash = await bcrypt.hash('x-Locked-123', 4);
    const superAdmin = await prisma.admin.create({ data: { fullName: 'Lock Super', email: `lock-super-${tag}@test.example`, passwordHash: hash, role: 'SUPER_ADMIN' } });
    const support = await prisma.admin.create({ data: { fullName: 'Lock Support', email: `lock-support-${tag}@test.example`, passwordHash: hash, role: 'SUPPORT_ADMIN' } });
    const client = await prisma.user.create({ data: { fullName: 'Lock Client', email: `lock-client-${tag}@test.example`, passwordHash: hash } });
    superToken = adminToken(superAdmin.id);
    supportToken = adminToken(support.id);
    clientId = client.id;
    clientToken = jwt.sign({ sub: client.id, email: client.email });
  });
  afterAll(async () => {
    await app?.close();
    await prisma.$disconnect();
  });

  const routes: [method: 'get' | 'post' | 'patch' | 'delete', path: string][] = [
    ['get', '/audit-logs'],
    ['post', '/audit-logs'],
    ['get', '/notifications'],
    ['post', '/notifications'],
    ['get', '/affiliates'],
    ['post', '/affiliates/commissions'],
    ['patch', '/affiliates/commissions/some-id/pay/some-wallet'],
    ['get', '/social-trading/follows'],
    ['post', '/social-trading/copy-trades'],
    ['patch', '/payouts/asset-rate'],
    ['post', '/payouts'],
    ['get', '/payouts'],
    ['patch', '/payment-gateways/some-id/enable'],
    ['post', '/payment-gateways'],
    ['post', '/expiries'],
    ['delete', '/expiries/60'],
    ['post', '/otc-markets'],
    ['patch', '/real-markets/EURUSD'],
    ['delete', '/timeframes/M1'],
    ['post', '/candles'],
    ['get', '/trading-accounts'],
    ['post', '/trading-accounts'],
    ['patch', '/trading-accounts/some-id'],
    ['patch', '/trading-accounts/some-id/reset-demo'],
  ];

  it.each(routes)('%s %s is refused without an admin session', async (method, path) => {
    await request(app.getHttpServer())[method](path).expect(401);
    await request(app.getHttpServer())[method](path).set('Authorization', `Bearer ${clientToken}`).expect(401);
  });

  it.each(routes)('%s %s is refused for admins below Super Administrator', async (method, path) => {
    await request(app.getHttpServer())[method](path).set('Authorization', `Bearer ${supportToken}`).expect(403);
  });

  it('clients reach only their own demo and trading accounts', async () => {
    const other = await prisma.user.create({ data: { fullName: 'Other Client', email: `lock-other-${tag}@test.example`, passwordHash: 'x' } });
    const ownAccount = await prisma.tradingAccount.create({ data: { userId: clientId, type: 'DEMO', currency: 'USD', balance: 10 } });
    const otherAccount = await prisma.tradingAccount.create({ data: { userId: other.id, type: 'DEMO', currency: 'USD', balance: 10 } });
    const http = () => request(app.getHttpServer());
    const auth = { Authorization: `Bearer ${clientToken}` };
    // No token at all
    await http().get(`/trading-accounts/user/${clientId}`).expect(401);
    await http().patch(`/demo-accounts/${ownAccount.id}/reset`).expect(401);
    // Someone else's data
    await http().get(`/trading-accounts/user/${other.id}`).set(auth).expect(403);
    await http().get(`/demo-accounts/user/${other.id}`).set(auth).expect(403);
    await http().patch(`/demo-accounts/user/${other.id}/switch-currency`).set(auth).send({ currency: 'KES' }).expect(403);
    await http().patch(`/demo-accounts/${otherAccount.id}/reset`).set(auth).expect(403);
    expect((await prisma.tradingAccount.findUnique({ where: { id: otherAccount.id } }))!.balance.toString()).toBe('10');
    // Own data still works
    await http().get(`/trading-accounts/user/${clientId}`).set(auth).expect(200);
    await http().get(`/demo-accounts/user/${clientId}`).set(auth).expect(200);
    await http().patch(`/demo-accounts/${ownAccount.id}/reset`).set(auth).expect(200);
  });

  it('a Super Administrator gets past the guard', async () => {
    // Some of these legacy list queries have pre-existing bugs (500); what matters here is that the guard admits a Super Admin.
    for (const path of ['/audit-logs', '/notifications', '/affiliates', '/social-trading/follows']) {
      const res = await request(app.getHttpServer()).get(path).set('Authorization', `Bearer ${superToken}`);
      expect([path, [401, 403].includes(res.status)]).toEqual([path, false]);
    }
  });
});
