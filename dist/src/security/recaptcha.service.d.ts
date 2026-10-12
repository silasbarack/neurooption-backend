export declare class RecaptchaService {
    getPublicConfig(): {
        enabled: boolean;
        siteKey: string;
        version: 'v2';
    };
    getTestConfig(): {
        available: boolean;
        siteKey: string;
        version: 'v2';
    };
    verifyTest(token: string | undefined): Promise<{
        verified: boolean;
        code: string;
    }>;
    verifyDiagnostic(token: string): Promise<{
        success: boolean;
        reason: string;
    }>;
    verify(token: string | undefined, _expectedAction: string): Promise<void>;
}
