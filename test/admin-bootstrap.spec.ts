/// <reference types="jest" />
import * as bcrypt from 'bcrypt';
import { AdminService } from '../src/admin/admin.service';

const KEY = 'k'.repeat(48);
const EMAIL = 'owner@example.com';
const STRONG = 'Str0ng!Password#1';

function setup(admins: Array<{ id: string; email: string; role: string; passwordHash: string }>) {
  const prisma = {
    admin: {
      count: jest.fn(async () => admins.length),
      findUnique: jest.fn(async ({ where }: { where: { email: string } }) => admins.find((a) => a.email === where.email) ?? null),
      update: jest.fn(async ({ where, data }: { where: { id: string }; data: { passwordHash: string } }) => {
        const admin = admins.find((a) => a.id === where.id)!;
        admin.passwordHash = data.passwordHash;
        return admin;
      }),
      create: jest.fn(async ({ data }: { data: { role: string } }) => ({ ...data })),
    },
  };
  return { service: new AdminService(prisma as never, {} as never), prisma };
}

describe('admin owner bootstrap', () => {
  const env = { ...process.env };
  beforeEach(() => {
    process.env.ADMIN_BOOTSTRAP_KEY = KEY;
    process.env.ADMIN_BOOTSTRAP_EMAIL = EMAIL;
    process.env.ADMIN_BOOTSTRAP_EXPIRES_AT = new Date(Date.now() + 3600_000).toISOString();
  });
  afterAll(() => { process.env = env; });

  it('is unavailable without the Render authorization or once it expires', async () => {
    delete process.env.ADMIN_BOOTSTRAP_KEY;
    expect(await setup([]).service.bootstrapStatus()).toEqual({ available: false });
    process.env.ADMIN_BOOTSTRAP_KEY = KEY;
    process.env.ADMIN_BOOTSTRAP_EXPIRES_AT = new Date(Date.now() - 1000).toISOString();
    expect(await setup([]).service.bootstrapStatus()).toEqual({ available: false });
  });

  it('reports create before any admin exists and reset afterwards', async () => {
    expect(await setup([]).service.bootstrapStatus()).toEqual({ available: true, mode: 'create' });
    const admins = [{ id: 'a1', email: EMAIL, role: 'SUPER_ADMIN', passwordHash: 'x' }];
    expect(await setup(admins).service.bootstrapStatus()).toEqual({ available: true, mode: 'reset' });
  });

  it('resets the authorized Super Administrator password', async () => {
    const admins = [{ id: 'a1', email: EMAIL, role: 'SUPER_ADMIN', passwordHash: 'old' }];
    const { service } = setup(admins);
    await service.bootstrapResetPassword({ email: ' Owner@Example.com ', password: STRONG, setupKey: KEY });
    expect(await bcrypt.compare(STRONG, admins[0].passwordHash)).toBe(true);
  });

  it('rejects a wrong key, another email, a weak password or a non-super admin', async () => {
    const admins = [
      { id: 'a1', email: EMAIL, role: 'SUPER_ADMIN', passwordHash: 'old' },
      { id: 'a2', email: 'other@example.com', role: 'RISK_ADMIN', passwordHash: 'old' },
    ];
    const { service, prisma } = setup(admins);
    await expect(service.bootstrapResetPassword({ email: EMAIL, password: STRONG, setupKey: 'z'.repeat(48) })).rejects.toThrow('Invalid administrator setup');
    await expect(service.bootstrapResetPassword({ email: 'other@example.com', password: STRONG, setupKey: KEY })).rejects.toThrow('not authorized');
    await expect(service.bootstrapResetPassword({ email: EMAIL, password: 'short', setupKey: KEY })).rejects.toThrow('14–128');
    process.env.ADMIN_BOOTSTRAP_EMAIL = 'other@example.com';
    await expect(service.bootstrapResetPassword({ email: 'other@example.com', password: STRONG, setupKey: KEY })).rejects.toThrow('No Super Administrator');
    expect(prisma.admin.update).not.toHaveBeenCalled();
  });

  it('still refuses to create a second administrator', async () => {
    const { service } = setup([{ id: 'a1', email: EMAIL, role: 'SUPER_ADMIN', passwordHash: 'x' }]);
    await expect(service.bootstrapFirstAdmin({ fullName: 'Owner', email: EMAIL, password: STRONG, setupKey: KEY })).rejects.toThrow('already provisioned');
  });
});
