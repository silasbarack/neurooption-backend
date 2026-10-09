/// <reference types="jest" />
import { INestApplication, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import request = require('supertest');
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../src/config/prisma.service';
import { JwtStrategy } from '../src/auth/jwt.strategy';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';
import { ProfileController } from '../src/profile/profile.controller';
import { ProfileService } from '../src/profile/profile.service';
import { EmailsService } from '../src/emails/emails.service';
import { EmailOutboxService } from '../src/emails/email-outbox.service';
import { DELETE_ACCOUNT_CONFIRMATION } from '../src/users/dto/delete-account.dto';

describe('account deletion authorization', () => {
  let app: INestApplication;
  let bearer: string;
  const users = {
    deleteMe: jest.fn().mockResolvedValue({ deleted: true }),
    findById: jest.fn(), getMe: jest.fn(), updateMe: jest.fn(), findAll: jest.fn(),
  };
  const profile = { getProfile: jest.fn(), updateProfile: jest.fn(), changePassword: jest.fn() };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [UsersController, ProfileController],
      providers: [
        JwtStrategy,
        { provide: PrismaService, useValue: { user: { findUnique: jest.fn().mockResolvedValue({
          id: 'owner', email: 'owner@example.test', fullName: 'Owner', role: 'USER',
          passwordHash: 'hash', deletedAt: null, authTokenVersion: 0,
        }) } } },
        { provide: UsersService, useValue: users },
        { provide: ProfileService, useValue: profile },
      ],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    bearer = new JwtService({ secret: process.env.JWT_SECRET || 'dev_secret' })
      .sign({ sub: 'owner', tokenVersion: 0 });
  });
  beforeEach(() => jest.clearAllMocks());
  afterAll(async () => { await app.close(); });

  it('rejects anonymous deletion on the own-account route', async () => {
    await request(app.getHttpServer()).delete('/users/me').send({}).expect(401);
    expect(users.deleteMe).not.toHaveBeenCalled();
  });
  it('rejects anonymous deletion on the legacy route', async () => {
    await request(app.getHttpServer()).delete('/users/me/owner').send({}).expect(401);
    expect(users.deleteMe).not.toHaveBeenCalled();
  });
  it('prevents deletion of a different user', async () => {
    await request(app.getHttpServer()).delete('/users/me/someone-else')
      .set('Authorization', 'Bearer ' + bearer)
      .send({ confirmation: DELETE_ACCOUNT_CONFIRMATION, currentPassword: 'password' }).expect(403);
    expect(users.deleteMe).not.toHaveBeenCalled();
  });
  it('requires the exact phrase on the server', async () => {
    await request(app.getHttpServer()).delete('/users/me')
      .set('Authorization', 'Bearer ' + bearer)
      .send({ confirmation: DELETE_ACCOUNT_CONFIRMATION.toLowerCase(), currentPassword: 'password' }).expect(400);
    expect(users.deleteMe).not.toHaveBeenCalled();
  });
  it('derives the account ID from the authenticated token', async () => {
    await request(app.getHttpServer()).delete('/users/me').set('Authorization', 'Bearer ' + bearer)
      .send({ confirmation: DELETE_ACCOUNT_CONFIRMATION, currentPassword: 'password', userId: 'someone-else' }).expect(200);
    expect(users.deleteMe).toHaveBeenCalledWith('owner', {
      confirmation: DELETE_ACCOUNT_CONFIRMATION, currentPassword: 'password',
    });
  });
  it('rejects anonymous profile access', async () => {
    await request(app.getHttpServer()).get('/profile/owner').expect(401);
    expect(profile.getProfile).not.toHaveBeenCalled();
  });
  it('prevents profile access to a different account', async () => {
    await request(app.getHttpServer()).get('/profile/someone-else')
      .set('Authorization', 'Bearer ' + bearer).expect(403);
    expect(profile.getProfile).not.toHaveBeenCalled();
  });
  it('checks the current password before any deletion writes', async () => {
    const prisma = { user: { findUnique: jest.fn().mockResolvedValue({
      id: 'owner', deletedAt: null, passwordHash: await bcrypt.hash('right-password', 4),
    }) }, $transaction: jest.fn() };
    const service = new UsersService(prisma as unknown as PrismaService, new EmailsService(), {} as EmailOutboxService);
    await expect(service.deleteMe('owner', {
      confirmation: DELETE_ACCOUNT_CONFIRMATION, currentPassword: 'wrong-password',
    })).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
