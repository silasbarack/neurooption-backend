import {
  AccountCurrency,
  LedgerAccountCode,
  LedgerAccountType,
  LedgerEntrySide,
  LedgerTransactionType,
  PaymentGatewayType,
  Prisma,
} from '@prisma/client';

export type Decimal = Prisma.Decimal;
export const Decimal = Prisma.Decimal;

/** Anything that can be turned into a Decimal: a number, numeric string, or Decimal itself. */
export type DecimalInput = Prisma.Decimal.Value;

/**
 * Either the top-level PrismaService, or the `tx` client handed to a
 * `prisma.$transaction(async (tx) => ...)` callback. Every LedgerService
 * method that posts entries accepts this so balance checks and the actual
 * posting can be composed inside one atomic database transaction.
 */
export type PrismaClientOrTx = Omit<
  Prisma.TransactionClient,
  '$transaction' | '$connect' | '$disconnect' | '$on' | '$use' | '$extends'
>;

export function toDecimal(value: DecimalInput): Decimal {
  return value instanceof Decimal ? value : new Decimal(value);
}

/** Deposit providers map to a real-money clearing account they land in. Used by the dev/admin endpoints. */
export type DepositProvider = 'MPESA' | 'CARD' | 'BANK' | 'CRYPTO' | 'BINANCE';

export const PROVIDER_CLEARING_ACCOUNT_CODE: Record<
  DepositProvider,
  LedgerAccountCode
> = {
  MPESA: LedgerAccountCode.PLATFORM_CASH_MPESA_CLEARING,
  CARD: LedgerAccountCode.PLATFORM_CASH_CARD_CLEARING,
  BANK: LedgerAccountCode.PLATFORM_CASH_BANK_CLEARING,
  CRYPTO: LedgerAccountCode.PLATFORM_CASH_CRYPTO_CLEARING,
  BINANCE: LedgerAccountCode.PLATFORM_CASH_CRYPTO_CLEARING,
};

/**
 * Maps the real, already-integrated PaymentGatewayType enum (used by
 * deposits.service.ts / withdrawals.service.ts) onto a ledger clearing
 * account code. This is separate from DepositProvider/
 * PROVIDER_CLEARING_ACCOUNT_CODE above because the two enums don't line up:
 * PaymentGatewayType has AIRTEL_MONEY/TKASH/EQUITEL/MANUAL (no CARD/BANK),
 * none of which have a dedicated clearing account yet.
 */
export function paymentGatewayTypeToClearingAccountCode(
  type: PaymentGatewayType,
): LedgerAccountCode {
  switch (type) {
    case PaymentGatewayType.MPESA:
      return LedgerAccountCode.PLATFORM_CASH_MPESA_CLEARING;
    case PaymentGatewayType.BINANCE_PAY:
      return LedgerAccountCode.PLATFORM_CASH_CRYPTO_CLEARING;
    case PaymentGatewayType.AIRTEL_MONEY:
    case PaymentGatewayType.TKASH:
    case PaymentGatewayType.EQUITEL:
    case PaymentGatewayType.MANUAL:
    default:
      // No dedicated clearing account exists for these gateways yet.
      // Route through the suspense account so the money is still tracked
      // and reconcilable, rather than guessing a specific-but-wrong
      // bucket. Add a PLATFORM_CASH_*_CLEARING code (and a case here) once
      // one of these gateways is actually wired up to move real money.
      return LedgerAccountCode.SUSPENSE_ACCOUNT;
  }
}

/** Every ledger account code's accounting type — derived here so callers can never mismatch them. */
export const LEDGER_ACCOUNT_TYPE: Record<LedgerAccountCode, LedgerAccountType> = {
  USER_REAL_AVAILABLE_LIABILITY: LedgerAccountType.LIABILITY,
  USER_OPEN_TRADE_ESCROW: LedgerAccountType.LIABILITY,
  USER_WITHDRAWAL_PENDING: LedgerAccountType.LIABILITY,
  PLATFORM_CASH_MPESA_CLEARING: LedgerAccountType.ASSET,
  PLATFORM_CASH_CARD_CLEARING: LedgerAccountType.ASSET,
  PLATFORM_CASH_BANK_CLEARING: LedgerAccountType.ASSET,
  PLATFORM_CASH_CRYPTO_CLEARING: LedgerAccountType.ASSET,
  PLATFORM_TRADING_REVENUE: LedgerAccountType.REVENUE,
  PLATFORM_TRADING_PAYOUT_EXPENSE: LedgerAccountType.EXPENSE,
  PAYMENT_PROCESSOR_FEES: LedgerAccountType.EXPENSE,
  BONUS_LIABILITY: LedgerAccountType.LIABILITY,
  SUSPENSE_ACCOUNT: LedgerAccountType.ASSET,
};

export const LEDGER_ACCOUNT_NAME: Record<LedgerAccountCode, string> = {
  USER_REAL_AVAILABLE_LIABILITY: 'User Available Balance',
  USER_OPEN_TRADE_ESCROW: 'User Open Trade Escrow',
  USER_WITHDRAWAL_PENDING: 'User Withdrawal Pending',
  PLATFORM_CASH_MPESA_CLEARING: 'Platform Cash - M-Pesa Clearing',
  PLATFORM_CASH_CARD_CLEARING: 'Platform Cash - Card Clearing',
  PLATFORM_CASH_BANK_CLEARING: 'Platform Cash - Bank Clearing',
  PLATFORM_CASH_CRYPTO_CLEARING: 'Platform Cash - Crypto Clearing',
  PLATFORM_TRADING_REVENUE: 'Platform Trading Revenue',
  PLATFORM_TRADING_PAYOUT_EXPENSE: 'Platform Trading Payout Expense',
  PAYMENT_PROCESSOR_FEES: 'Payment Processor Fees',
  BONUS_LIABILITY: 'Bonus Liability',
  SUSPENSE_ACCOUNT: 'Suspense Account',
};

export type LedgerEntryInput = {
  accountId: string;
  side: LedgerEntrySide;
  amount: DecimalInput;
  /** Defaults to the parent transaction's currency when omitted. */
  currency?: AccountCurrency;
  memo?: string;
};

export type PostDoubleEntryInput = {
  type: LedgerTransactionType;
  currency: AccountCurrency;
  description?: string;
  /** Prevents duplicate posting (e.g. a retried payment webhook). */
  idempotencyKey?: string;
  userId?: string;
  tradeId?: string;
  depositId?: string;
  withdrawalId?: string;
  externalReference?: string;
  entries: LedgerEntryInput[];
};

export type ConfirmDepositInput = {
  userId: string;
  amount: DecimalInput;
  currency: AccountCurrency;
  /** Which platform clearing account the money landed in. */
  clearingAccountCode: LedgerAccountCode;
  externalReference?: string;
  idempotencyKey: string;
  depositId?: string;
  description?: string;
};

export type RequestWithdrawalInput = {
  userId: string;
  amount: DecimalInput;
  currency: AccountCurrency;
  withdrawalId: string;
  idempotencyKey?: string;
  description?: string;
};

export type MarkWithdrawalPaidInput = {
  userId: string;
  amount: DecimalInput;
  currency: AccountCurrency;
  withdrawalId: string;
  /** Which platform clearing account the payout left from. */
  clearingAccountCode: LedgerAccountCode;
  idempotencyKey?: string;
  description?: string;
};

export type RejectWithdrawalInput = {
  userId: string;
  amount: DecimalInput;
  currency: AccountCurrency;
  withdrawalId: string;
  reason?: string;
  idempotencyKey?: string;
};

export type PlaceTradeInput = {
  userId: string;
  tradeId: string;
  stakeAmount: DecimalInput;
  currency: AccountCurrency;
  idempotencyKey?: string;
};

export type SettleTradeWonInput = {
  userId: string;
  tradeId: string;
  stakeAmount: DecimalInput;
  profitAmount: DecimalInput;
  currency: AccountCurrency;
  idempotencyKey?: string;
};

export type SettleTradeLostInput = {
  userId: string;
  tradeId: string;
  stakeAmount: DecimalInput;
  currency: AccountCurrency;
  idempotencyKey?: string;
};

export type RefundTradeInput = {
  userId: string;
  tradeId: string;
  stakeAmount: DecimalInput;
  currency: AccountCurrency;
  idempotencyKey?: string;
};
