import { User } from '@prisma/client';

export function publicUser<T extends User>(user: T): Omit<T, 'passwordHash' | 'authTokenVersion'> {
  const safe = { ...user };
  Reflect.deleteProperty(safe, 'passwordHash');
  Reflect.deleteProperty(safe, 'authTokenVersion');
  return safe;
}
