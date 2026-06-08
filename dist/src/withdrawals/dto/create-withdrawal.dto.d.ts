import { PaymentGatewayType } from '@prisma/client';
export declare class CreateWithdrawalDto {
    userId: string;
    walletId: string;
    gatewayType: PaymentGatewayType;
    amount: number;
    currency?: string;
    phone?: string;
}
