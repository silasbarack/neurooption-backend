(async ()=>{
  const fetch = global.fetch || require('node-fetch');
  const email = 'silasbarack5@gmail.com';
  const password = 'NewPassw0rd!';

  try {
    const res = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    console.log('login status', res.status);
    const text = await res.text();
    console.log(text.slice(0, 2000));
  } catch (e) {
    console.error('login error', e.message);
    process.exit(1);
  }
})();
