"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEDGER_ACCOUNT_NAME = exports.LEDGER_ACCOUNT_TYPE = exports.PROVIDER_CLEARING_ACCOUNT_CODE = exports.Decimal = void 0;
exports.toDecimal = toDecimal;
exports.paymentGatewayTypeToClearingAccountCode = paymentGatewayTypeToClearingAccountCode;
const client_1 = require("@prisma/client");
exports.Decimal = client_1.Prisma.Decimal;
function toDecimal(value) {
    return value instanceof exports.Decimal ? value : new exports.Decimal(value);
}
exports.PROVIDER_CLEARING_ACCOUNT_CODE = {
    MPESA: client_1.LedgerAccountCode.PLATFORM_CASH_MPESA_CLEARING,
    CARD: client_1.LedgerAccountCode.PLATFORM_CASH_CARD_CLEARING,
    BANK: client_1.LedgerAccountCode.PLATFORM_CASH_BANK_CLEARING,
    CRYPTO: client_1.LedgerAccountCode.PLATFORM_CASH_CRYPTO_CLEARING,
    BINANCE: client_1.LedgerAccountCode.PLATFORM_CASH_CRYPTO_CLEARING,
};
function paymentGatewayTypeToClearingAccountCode(type) {
    switch (type) {
        case client_1.PaymentGatewayType.MPESA:
            return client_1.LedgerAccountCode.PLATFORM_CASH_MPESA_CLEARING;
        case client_1.PaymentGatewayType.BINANCE_PAY:
            return client_1.LedgerAccountCode.PLATFORM_CASH_CRYPTO_CLEARING;
        case client_1.PaymentGatewayType.AIRTEL_MONEY:
        case client_1.PaymentGatewayType.TKASH:
        case client_1.PaymentGatewayType.EQUITEL:
        case client_1.PaymentGatewayType.MANUAL:
        default:
            return client_1.LedgerAccountCode.SUSPENSE_ACCOUNT;
    }
}
exports.LEDGER_ACCOUNT_TYPE = {
    USER_REAL_AVAILABLE_LIABILITY: client_1.LedgerAccountType.LIABILITY,
    USER_OPEN_TRADE_ESCROW: client_1.LedgerAccountType.LIABILITY,
    USER_WITHDRAWAL_PENDING: client_1.LedgerAccountType.LIABILITY,
    PLATFORM_CASH_MPESA_CLEARING: client_1.LedgerAccountType.ASSET,
    PLATFORM_CASH_CARD_CLEARING: client_1.LedgerAccountType.ASSET,
    PLATFORM_CASH_BANK_CLEARING: client_1.LedgerAccountType.ASSET,
    PLATFORM_CASH_CRYPTO_CLEARING: client_1.LedgerAccountType.ASSET,
    PLATFORM_TRADING_REVENUE: client_1.LedgerAccountType.REVENUE,
    PLATFORM_TRADING_PAYOUT_EXPENSE: client_1.LedgerAccountType.EXPENSE,
    PAYMENT_PROCESSOR_FEES: client_1.LedgerAccountType.EXPENSE,
    BONUS_LIABILITY: client_1.LedgerAccountType.LIABILITY,
    SUSPENSE_ACCOUNT: client_1.LedgerAccountType.ASSET,
};
exports.LEDGER_ACCOUNT_NAME = {
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
//# sourceMappingURL=ledger.types.js.map