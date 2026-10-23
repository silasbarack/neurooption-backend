import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1792786243411 implements MigrationInterface {
    name = 'InitialSchema1792786243411'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('trader', 'admin', 'affiliate')`);
        await queryRunner.query(`CREATE TYPE "public"."users_kycstatus_enum" AS ENUM('pending', 'verified', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "name" character varying NOT NULL, "phone" character varying, "country" character varying, "balance" numeric(20,8) NOT NULL DEFAULT '0', "demoBalance" numeric(20,8) NOT NULL DEFAULT '10000', "role" "public"."users_role_enum" NOT NULL DEFAULT 'trader', "kycStatus" "public"."users_kycstatus_enum" NOT NULL DEFAULT 'pending', "referralCode" character varying, "referredBy" character varying, "avatarUrl" character varying, "twoFactorEnabled" boolean NOT NULL DEFAULT false, "twoFactorSecret" character varying, "totalTrades" integer NOT NULL DEFAULT '0', "winTrades" integer NOT NULL DEFAULT '0', "totalPnl" numeric(10,2) NOT NULL DEFAULT '0', "lastLoginAt" TIMESTAMP, "isActive" boolean NOT NULL DEFAULT true, "isPublicTrader" boolean NOT NULL DEFAULT false, "bio" character varying, "resetCodeHash" character varying, "resetCodeExpiresAt" TIMESTAMP, "resetCodeAttempts" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."trades_direction_enum" AS ENUM('CALL', 'PUT')`);
        await queryRunner.query(`CREATE TYPE "public"."trades_status_enum" AS ENUM('open', 'win', 'loss', 'tie', 'cancelled')`);
        await queryRunner.query(`CREATE TYPE "public"."trades_mode_enum" AS ENUM('real', 'demo')`);
        await queryRunner.query(`CREATE TABLE "trades" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "assetId" character varying NOT NULL, "assetName" character varying NOT NULL, "direction" "public"."trades_direction_enum" NOT NULL, "status" "public"."trades_status_enum" NOT NULL DEFAULT 'open', "mode" "public"."trades_mode_enum" NOT NULL DEFAULT 'demo', "amount" numeric(20,8) NOT NULL, "payout" numeric(5,2) NOT NULL, "openPrice" numeric(20,8) NOT NULL, "closePrice" numeric(20,8), "durationSeconds" integer NOT NULL, "profitLoss" numeric(20,8) NOT NULL DEFAULT '0', "expiresAt" TIMESTAMP NOT NULL, "signalId" character varying, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "closedAt" TIMESTAMP, CONSTRAINT "PK_c6d7c36a837411ba5194dc58595" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_078a3ae66af5a619e23c960aaf" ON "trades" ("assetId", "status") `);
        await queryRunner.query(`CREATE INDEX "IDX_70f1719ba2cc812a6e8454718c" ON "trades" ("userId", "status") `);
        await queryRunner.query(`CREATE TYPE "public"."payments_type_enum" AS ENUM('deposit', 'withdrawal')`);
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled')`);
        await queryRunner.query(`CREATE TYPE "public"."payments_method_enum" AS ENUM('stripe', 'crypto', 'bank_wire', 'skrill', 'neteller', 'perfect_money')`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "type" "public"."payments_type_enum" NOT NULL, "status" "public"."payments_status_enum" NOT NULL DEFAULT 'pending', "method" "public"."payments_method_enum" NOT NULL, "amount" numeric(20,2) NOT NULL, "currency" character varying NOT NULL DEFAULT 'USD', "txHash" character varying, "externalId" character varying, "metadata" jsonb, "walletAddress" character varying, "failureReason" character varying, "processedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "signals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "assetId" character varying NOT NULL, "assetName" character varying NOT NULL, "direction" character varying NOT NULL, "confidence" integer NOT NULL, "timeframe" character varying NOT NULL, "durationSeconds" integer NOT NULL, "signalPrice" numeric(20,8) NOT NULL, "indicators" jsonb NOT NULL, "reasons" jsonb, "result" character varying, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "expiresAt" TIMESTAMP NOT NULL, CONSTRAINT "PK_04eeac09c09b65bc55c628c101d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying, "action" character varying NOT NULL, "data" jsonb, "ipAddress" character varying, "userAgent" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5ee52ff271c0f9bca5f97daa0a" ON "audit_logs" ("userId", "action") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_5ee52ff271c0f9bca5f97daa0a"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TABLE "signals"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TYPE "public"."payments_method_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payments_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_70f1719ba2cc812a6e8454718c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_078a3ae66af5a619e23c960aaf"`);
        await queryRunner.query(`DROP TABLE "trades"`);
        await queryRunner.query(`DROP TYPE "public"."trades_mode_enum"`);
        await queryRunner.query(`DROP TYPE "public"."trades_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."trades_direction_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_kycstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
