const { spawnSync } = require('child_process');

const databaseUrl = String(process.env.DATABASE_URL || '').trim();

if (databaseUrl) {
  console.log('[NeuroOption] DATABASE_URL detected. Applying Prisma migrations...');
  const migrate = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  });

  if (migrate.status !== 0) {
    console.error('[NeuroOption] Prisma migration failed. Refusing to start against an unprepared database.');
    process.exit(migrate.status || 1);
  }
} else {
  console.warn('[NeuroOption] DATABASE_URL is not configured. Starting in market-only mode.');
}

const app = spawnSync('node', ['dist/src/main.js'], {
  stdio: 'inherit',
  env: process.env,
});

process.exit(app.status || 0);
