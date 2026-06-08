(async ()=>{
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const crypto = require('crypto');
  const fetch = global.fetch || require('node-fetch');
  const email = 'silasbarack5@gmail.com';
  const plaintext = 'test-reset-token-12345';
  const hashed = crypto.createHash('sha256').update(plaintext).digest('hex');

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error('User not found');
      process.exit(1);
    }

    const token = await prisma.passwordResetToken.create({
      data: {
        token: hashed,
        user: { connect: { id: user.id } },
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    console.log('Created token id', token.id);

    const res = await fetch('http://localhost:3000/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: plaintext, password: 'NewPassw0rd!' }),
    });

    console.log('reset status', res.status);
    console.log(await res.text());
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
