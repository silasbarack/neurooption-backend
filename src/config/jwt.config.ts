export const jwtConfig = () => ({
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    adminExpiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '12h',
  },
});