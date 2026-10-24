import { PaymentDirection, PaymentGatewayType } from '@prisma/client';
export declare class CreatePaymentGatewayDto {
    name: string;
    type: PaymentGatewayType;
    direction: PaymentDirection;
    isActive?: boolean;
    publicKey?: string;
    secretKey?: string;
    callbackUrl?: string;
}
