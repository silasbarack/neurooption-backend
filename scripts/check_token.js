(async ()=>{
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const email = 'silasbarack5@gmail.com';
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error('User not found');
      process.exit(1);
    }
    const tokens = await prisma.passwordResetToken.findMany({ where: { userId: user.id } });
    console.log('tokens count for user', tokens.length);
    tokens.forEach(t => console.log({ id: t.id, token: t.token, expiresAt: t.expiresAt }));
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
