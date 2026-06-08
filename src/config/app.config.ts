export const appConfig = () => ({
  app: {
    name: process.env.APP_NAME || 'NeuroOption',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
});