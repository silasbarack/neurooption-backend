import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../config/prisma.service';
import { EmailsService } from '../emails/emails.service';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly emailsService;
    constructor(prisma: PrismaService, jwtService: JwtService, emailsService: EmailsService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        user: {
            id: any;
            fullName: any;
            email: any;
            phone: any;
            role: any;
        };
    }>;
    login(dto: {
        email: string;
        password: string;
    }): Promise<{
        accessToken: string;
        user: {
            id: any;
            fullName: any;
            email: any;
            phone: any;
            role: any;
        };
    }>;
    forgotPassword(dto: {
        email: string;
    }): Promise<{
        message: string;
    }>;
    resetPassword(dto: {
        token: string;
        password: string;
    }): Promise<{
        message: string;
    }>;
    private buildAuthResponse;
}
