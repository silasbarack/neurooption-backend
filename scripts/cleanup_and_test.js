(async ()=>{
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const fetch = global.fetch || require('node-fetch');
  const email = 'silasbarack5@gmail.com';
  const password = 'NewPassw0rd!';

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error('User not found');
      process.exit(1);
    }

    const del = await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    console.log('deleted tokens count', del.count);

    const loginRes = await fetch('http://localhost:3000/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    console.log('login status', loginRes.status);
    const loginBody = await loginRes.json();
    console.log('login body sample', { user: loginBody.user?.id ? loginBody.user.id : null });
    const token = loginBody.accessToken;

    const headers = { 'Authorization': 'Bearer ' + token };
    const profileRes = await fetch(`http://localhost:3000/profile/${user.id}`, { headers });
    console.log('/profile status', profileRes.status);
    console.log(await profileRes.text());

    const usersRes = await fetch(`http://localhost:3000/users/${user.id}`, { headers });
    console.log('/users/:id status', usersRes.status);
    console.log(await usersRes.text());

  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
