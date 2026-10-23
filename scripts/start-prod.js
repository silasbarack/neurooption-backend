const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const databaseUrl = String(process.env.DATABASE_URL || '').trim();
const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');

/**
 * `prisma migrate deploy` takes ~11 s on the production instance even when
 * there is nothing to apply, and it runs on every cold start. One query
 * against Prisma's own migrations table tells us the same thing in well
 * under a second. Anything other than "every local migration is applied
 * and none failed" (missing table, failed or rolled-back rows, any error)
 * falls back to the full `migrate deploy`.
 */
async function allMigrationsApplied() {
  const local = fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.$queryRawUnsafe(
      'SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations"',
    );
    if (rows.some((row) => !row.finished_at && !row.rolled_back_at)) return false;
    const applied = new Set(
      rows.filter((row) => row.finished_at && !row.rolled_back_at).map((row) => row.migration_name),
    );
    return local.every((name) => applied.has(name));
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

async function migrate() {
  if (!databaseUrl) {
    console.warn('[NeuroOption] DATABASE_URL is not configured. Starting in market-only mode.');
    return;
  }

  const upToDate = await allMigrationsApplied().catch((error) => {
    const reason = error.code || String(error.message).trim().split('\n').pop();
    console.warn(`[NeuroOption] Could not check applied migrations (${reason}).`);
    return false;
  });
  if (upToDate) {
    console.log('[NeuroOption] Database schema is up to date. Skipping prisma migrate deploy.');
    return;
  }

  console.log('[NeuroOption] DATABASE_URL detected. Applying Prisma migrations...');
  const result = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  });

  if (result.status !== 0) {
    console.error('[NeuroOption] Prisma migration failed. Refusing to start against an unprepared database.');
    process.exit(result.status || 1);
  }
}

migrate().then(() => {
  const app = spawnSync('node', ['dist/src/main.js'], {
    stdio: 'inherit',
    env: process.env,
  });

  process.exit(app.status || 0);
});
