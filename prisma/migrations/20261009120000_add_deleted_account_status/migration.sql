-- Account deletion keeps the User row (financial records reference it) but
-- marks it closed. Additive only: one new enum value; no data is changed.

-- AlterEnum
ALTER TYPE "AccountStatus" ADD VALUE 'DELETED';
