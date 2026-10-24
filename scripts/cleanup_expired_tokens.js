#!/usr/bin/env node
(async () => {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  try {
    const now = new Date();
    const result = await prisma.passwordResetToken.deleteMany({ where: { expiresAt: { lt: now } } });
    console.log('Deleted expired passwordResetToken count:', result.count);
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error deleting expired tokens', err);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
