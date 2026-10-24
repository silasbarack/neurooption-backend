import { EmailType } from '@prisma/client';
export declare class CreateEmailDto {
    userId: string;
    type: EmailType;
    subject: string;
    body: string;
    metadata?: Record<string, unknown>;
}
