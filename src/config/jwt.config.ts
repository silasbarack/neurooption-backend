export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret && (process.env.NODE_ENV !== 'production' || secret.length >= 32)) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Production JWT_SECRET must contain at least 32 characters.');
  }
  return 'local-development-only-secret-never-use-in-production';
}

export const jwtConfig = () => ({
  jwt: {
    secret: getJwtSecret(),
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    adminExpiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '12h',
  },
});
