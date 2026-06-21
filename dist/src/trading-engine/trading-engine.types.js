"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXCHANGE_RATES_TO_USD_BASE = exports.ACCOUNT_CURRENCIES = exports.ACCOUNT_TYPES = void 0;
exports.currencyToUsd = currencyToUsd;
exports.usdToCurrency = usdToCurrency;
exports.ACCOUNT_TYPES = ['QT Demo', 'QT Real'];
exports.ACCOUNT_CURRENCIES = [
    'USD',
    'KES',
    'UGX',
    'TZS',
    'NGN',
    'XOF',
    'EUR',
    'CAD',
    'JPY',
    'CNY',
    'AOA',
    'ZAR',
    'BRL',
];
exports.EXCHANGE_RATES_TO_USD_BASE = {
    USD: 1,
    KES: 129.5,
    UGX: 3710,
    TZS: 2600,
    NGN: 1510,
    XOF: 610,
    EUR: 0.92,
    CAD: 1.37,
    JPY: 157,
    CNY: 7.25,
    AOA: 890,
    ZAR: 18.1,
    BRL: 5.45,
};
function currencyToUsd(amount, currency) {
    return amount / exports.EXCHANGE_RATES_TO_USD_BASE[currency];
}
function usdToCurrency(amountUsd, currency) {
    return amountUsd * exports.EXCHANGE_RATES_TO_USD_BASE[currency];
}
//# sourceMappingURL=trading-engine.types.js.map