export declare const paymentConfig: () => {
    payments: {
        mpesa: {
            consumerKey: string;
            consumerSecret: string;
            shortcode: string;
            passkey: string;
            callbackUrl: string;
            environment: string;
        };
        airtel: {
            clientId: string;
            clientSecret: string;
            merchantId: string;
            callbackUrl: string;
            environment: string;
        };
        tkash: {
            clientId: string;
            clientSecret: string;
            shortcode: string;
            callbackUrl: string;
            environment: string;
        };
        equitel: {
            clientId: string;
            clientSecret: string;
            paybill: string;
            callbackUrl: string;
            environment: string;
        };
        binancePay: {
            apiKey: string;
            apiSecret: string;
            merchantId: string;
            callbackUrl: string;
            environment: string;
        };
    };
};
