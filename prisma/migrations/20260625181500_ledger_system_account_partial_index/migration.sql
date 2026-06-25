-- Postgres treats every NULL as distinct from every other NULL in a
-- standard multi-column UNIQUE constraint, so the existing
-- "LedgerAccount_userId_code_currency_key" unique index does NOT prevent
-- duplicate system accounts (rows where "userId" IS NULL). Add a partial
-- unique index that covers exactly that case: at most one system account
-- per (code, currency).
CREATE UNIQUE INDEX "LedgerAccount_system_code_currency_key"
  ON "LedgerAccount" ("code", "currency")
  WHERE "userId" IS NULL;
