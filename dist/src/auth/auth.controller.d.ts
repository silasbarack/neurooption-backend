import { RecaptchaService } from '../security/recaptcha.service';
import type { AuthenticatedRequest } from '../payments/authenticated-request';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthController {
    private readonly authService;
    private readonly captcha;
    private readonly testAttempts;
    constructor(authService: AuthService, captcha: RecaptchaService);
    recaptchaConfig(): {
        enabled: boolean;
        siteKey: string;
        version: "v2";
    };
    testConfig(): {
        available: boolean;
        siteKey: string;
        version: "v2";
    };
    testCaptcha(req: AuthenticatedRequest, body: {
        token?: string;
    }): Promise<{
        verified: boolean;
        code: string;
    }>;
    register(dto: RegisterDto): Promise<{
        success: boolean;
        message: string;
        welcomeEmailSent: boolean;
        welcomeEmailHint: string;
        token: string;
        accessToken: string;
        user: any;
    }>;
    resendWelcome(req: AuthenticatedRequest): Promise<{
        success: boolean;
        emailSent: boolean;
        emailHint: string;
        message: string;
    }>;
    verifyEmail(body: {
        token?: string;
    }): Promise<{
        success: boolean;
        alreadyVerified: boolean;
        message: string;
    }>;
    resendVerification(req: AuthenticatedRequest): Promise<{
        success: boolean;
        emailSent: boolean;
        alreadyVerified: boolean;
        message: string;
        emailHint?: undefined;
    } | {
        success: boolean;
        emailSent: boolean;
        alreadyVerified: boolean;
        emailHint: string;
        message: string;
    }>;
    login(dto: LoginDto): Promise<{
        success: boolean;
        message: string;
        token: string;
        accessToken: string;
        user: any;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
