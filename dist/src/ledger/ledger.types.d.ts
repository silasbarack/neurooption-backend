import { AccountCurrency, LedgerAccountCode, LedgerAccountType, LedgerEntrySide, LedgerTransactionType, PaymentGatewayType, Prisma } from '@prisma/client';
export type Decimal = Prisma.Decimal;
export declare const Decimal: typeof Prisma.Decimal;
export type DecimalInput = Prisma.Decimal.Value;
export type PrismaClientOrTx = Omit<Prisma.TransactionClient, '$transaction' | '$connect' | '$disconnect' | '$on' | '$use' | '$extends'>;
export declare function toDecimal(value: DecimalInput): Decimal;
export type DepositProvider = 'MPESA' | 'CARD' | 'BANK' | 'CRYPTO' | 'BINANCE';
export declare const PROVIDER_CLEARING_ACCOUNT_CODE: Record<DepositProvider, LedgerAccountCode>;
export declare function paymentGatewayTypeToClearingAccountCode(type: PaymentGatewayType): LedgerAccountCode;
export declare const LEDGER_ACCOUNT_TYPE: Record<LedgerAccountCode, LedgerAccountType>;
export declare const LEDGER_ACCOUNT_NAME: Record<LedgerAccountCode, string>;
export type LedgerEntryInput = {
    accountId: string;
    side: LedgerEntrySide;
    amount: DecimalInput;
    currency?: AccountCurrency;
    memo?: string;
};
export type PostDoubleEntryInput = {
    type: LedgerTransactionType;
    currency: AccountCurrency;
    description?: string;
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
