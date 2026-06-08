"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentConfig = void 0;
const paymentConfig = () => ({
    payments: {
        mpesa: {
            consumerKey: process.env.MPESA_CONSUMER_KEY,
            consumerSecret: process.env.MPESA_CONSUMER_SECRET,
            shortcode: process.env.MPESA_SHORTCODE,
            passkey: process.env.MPESA_PASSKEY,
            callbackUrl: process.env.MPESA_CALLBACK_URL,
            environment: process.env.MPESA_ENV || 'sandbox',
        },
        airtel: {
            clientId: process.env.AIRTEL_CLIENT_ID,
            clientSecret: process.env.AIRTEL_CLIENT_SECRET,
            merchantId: process.env.AIRTEL_MERCHANT_ID,
            callbackUrl: process.env.AIRTEL_CALLBACK_URL,
            environment: process.env.AIRTEL_ENV || 'sandbox',
        },
        tkash: {
            clientId: process.env.TKASH_CLIENT_ID,
            clientSecret: process.env.TKASH_CLIENT_SECRET,
            shortcode: process.env.TKASH_SHORTCODE,
            callbackUrl: process.env.TKASH_CALLBACK_URL,
            environment: process.env.TKASH_ENV || 'sandbox',
        },
        equitel: {
            clientId: process.env.EQUITEL_CLIENT_ID,
            clientSecret: process.env.EQUITEL_CLIENT_SECRET,
            paybill: process.env.EQUITEL_PAYBILL,
            callbackUrl: process.env.EQUITEL_CALLBACK_URL,
            environment: process.env.EQUITEL_ENV || 'sandbox',
        },
        binancePay: {
            apiKey: process.env.BINANCE_PAY_API_KEY,
            apiSecret: process.env.BINANCE_PAY_API_SECRET,
            merchantId: process.env.BINANCE_PAY_MERCHANT_ID,
            callbackUrl: process.env.BINANCE_PAY_CALLBACK_URL,
            environment: process.env.BINANCE_PAY_ENV || 'sandbox',
        },
    },
});
exports.paymentConfig = paymentConfig;
//# sourceMappingURL=payment.config.js.map