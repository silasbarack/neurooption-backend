/// <reference types="jest" />
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';

import { AffiliatesModule } from '../src/affiliates/affiliates.module';
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

  const adminToken = (id: string) =>
    jwt.sign({ sub: id, purpose: 'admin-dashboard' }, { expiresIn: '5m', issuer: 'neurooption-admin', audience: 'neurooption-admin-dashboard' });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaModule, AuditLogsModule, NotificationsModule, AffiliatesModule, SocialTradingModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    const hash = await bcrypt.hash('x-Locked-123', 4);
    const superAdmin = await prisma.admin.create({ data: { fullName: 'Lock Super', email: `lock-super-${tag}@test.example`, passwordHash: hash, role: 'SUPER_ADMIN' } });
    const support = await prisma.admin.create({ data: { fullName: 'Lock Support', email: `lock-support-${tag}@test.example`, passwordHash: hash, role: 'SUPPORT_ADMIN' } });
    const client = await prisma.user.create({ data: { fullName: 'Lock Client', email: `lock-client-${tag}@test.example`, passwordHash: hash } });
    superToken = adminToken(superAdmin.id);
    supportToken = adminToken(support.id);
    clientToken = jwt.sign({ sub: client.id, email: client.email });
  });
  afterAll(async () => {
    await app?.close();
    await prisma.$disconnect();
  });

  const routes: [method: 'get' | 'post' | 'patch', path: string][] = [
    ['get', '/audit-logs'],
    ['post', '/audit-logs'],
    ['get', '/notifications'],
    ['post', '/notifications'],
    ['get', '/affiliates'],
    ['post', '/affiliates/commissions'],
    ['patch', '/affiliates/commissions/some-id/pay/some-wallet'],
    ['get', '/social-trading/follows'],
    ['post', '/social-trading/copy-trades'],
  ];

  it.each(routes)('%s %s is refused without an admin session', async (method, path) => {
    await request(app.getHttpServer())[method](path).expect(401);
    await request(app.getHttpServer())[method](path).set('Authorization', `Bearer ${clientToken}`).expect(401);
  });

  it.each(routes)('%s %s is refused for admins below Super Administrator', async (method, path) => {
    await request(app.getHttpServer())[method](path).set('Authorization', `Bearer ${supportToken}`).expect(403);
  });

  it('a Super Administrator gets past the guard', async () => {
    // Some of these legacy list queries have pre-existing bugs (500); what matters here is that the guard admits a Super Admin.
    for (const path of ['/audit-logs', '/notifications', '/affiliates', '/social-trading/follows']) {
      const res = await request(app.getHttpServer()).get(path).set('Authorization', `Bearer ${superToken}`);
      expect([path, [401, 403].includes(res.status)]).toEqual([path, false]);
    }
  });
});
