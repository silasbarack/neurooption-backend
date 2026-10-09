/// <reference types="jest" />
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request = require('supertest');

import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';

/** The route table must not let anyone list, edit or delete other users. */
describe('/users access control', () => {
  let app: INestApplication;
  const users = {
    findAll: jest.fn(async () => [{ id: 'a' }]),
    findById: jest.fn(async (id: string) => ({ id })),
    getMe: jest.fn(async (id: string) => ({ id })),
    updateMe: jest.fn(async (id: string) => ({ id })),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: users }],
    })
      // Stand-in for the JWT check: the "token" header carries "id:role".
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: any) => {
          const req = ctx.switchToHttp().getRequest();
          const raw = req.headers.token as string | undefined;
          if (!raw) return false;
          const [id, role] = raw.split(':');
          req.user = { id, role };
          return true;
        },
      })
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());
  beforeEach(() => jest.clearAllMocks());

  it('has the real sign-in guard attached to the whole controller', () => {
    const guards = Reflect.getMetadata('__guards__', UsersController) as unknown[];
    expect(guards).toContain(JwtAuthGuard);
  });

  it('requires sign-in on every route', async () => {
    for (const [method, path] of [
      ['get', '/users'], ['get', '/users/u1'], ['get', '/users/me/u1'],
      ['patch', '/users/u1'], ['patch', '/users/me/u1'],
    ] as const) {
      await (request(app.getHttpServer()) as any)[method](path).expect(403);
    }
    expect(users.findAll).not.toHaveBeenCalled();
  });

  it('keeps listing and other users admin-only', async () => {
    await request(app.getHttpServer()).get('/users').set('token', 'u1:USER').expect(403);
    await request(app.getHttpServer()).get('/users/u2').set('token', 'u1:USER').expect(403);
    await request(app.getHttpServer()).patch('/users/u2').set('token', 'u1:USER').send({ fullName: 'x' }).expect(403);
    await request(app.getHttpServer()).get('/users').set('token', 'a1:ADMIN').expect(200);
    await request(app.getHttpServer()).get('/users/u2').set('token', 'a1:ADMIN').expect(200);
    expect(users.updateMe).not.toHaveBeenCalled();
  });

  it('lets people read and edit only themselves', async () => {
    await request(app.getHttpServer()).get('/users/me/u2').set('token', 'u1:USER').expect(403);
    await request(app.getHttpServer()).patch('/users/me/u2').set('token', 'u1:USER').send({ fullName: 'x' }).expect(403);
    await request(app.getHttpServer()).get('/users/me/u1').set('token', 'u1:USER').expect(200);
    await request(app.getHttpServer()).patch('/users/me/u1').set('token', 'u1:USER').send({ fullName: 'x' }).expect(200);
    expect(users.updateMe).toHaveBeenCalledTimes(1);
  });

  it('has no delete route: nobody can hard-delete a user here', async () => {
    for (const path of ['/users/u1', '/users/me/u1']) {
      await request(app.getHttpServer()).delete(path).set('token', 'a1:ADMIN').expect(404);
      await request(app.getHttpServer()).delete(path).set('token', 'u1:USER').expect(404);
    }
  });
});
