import type { AuthenticatedRequest } from './authenticated-request';
import { StkPushDto } from './dto/stk-push.dto';
import { MpesaService, StkCallbackBody } from './mpesa.service';
export declare class MpesaController {
    private readonly mpesa;
    private readonly logger;
    constructor(mpesa: MpesaService);
    config(): {
        configured: boolean;
        environment: "sandbox" | "production";
        minAmount: number;
        maxAmount: number;
    };
    startDeposit(req: AuthenticatedRequest, dto: StkPushDto): Promise<{
        depositId: string;
        status: "PENDING";
        amount: number;
        currency: string;
        phone: string;
        message: string;
    }>;
    depositStatus(req: AuthenticatedRequest, id: string): Promise<{
        depositId: string;
        status: import(".prisma/client").$Enums.TransactionStatus;
        amount: number;
        currency: string;
        phone: string;
        receipt: string;
        message: string;
    }>;
    callback(token: string, body: StkCallbackBody): Promise<{
        ResultCode: number;
        ResultDesc: string;
    }>;
}
