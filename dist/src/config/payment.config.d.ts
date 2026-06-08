export declare const paymentConfig: () => {
    payments: {
        mpesa: {
            consumerKey: string | undefined;
            consumerSecret: string | undefined;
            shortcode: string | undefined;
            passkey: string | undefined;
            callbackUrl: string | undefined;
            environment: string;
        };
        airtel: {
            clientId: string | undefined;
            clientSecret: string | undefined;
            merchantId: string | undefined;
            callbackUrl: string | undefined;
            environment: string;
        };
        tkash: {
            clientId: string | undefined;
            clientSecret: string | undefined;
            shortcode: string | undefined;
            callbackUrl: string | undefined;
            environment: string;
        };
        equitel: {
            clientId: string | undefined;
            clientSecret: string | undefined;
            paybill: string | undefined;
            callbackUrl: string | undefined;
            environment: string;
        };
        binancePay: {
            apiKey: string | undefined;
            apiSecret: string | undefined;
            merchantId: string | undefined;
            callbackUrl: string | undefined;
            environment: string;
        };
    };
};
