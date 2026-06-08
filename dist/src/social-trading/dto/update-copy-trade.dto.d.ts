import { CopyTradeStatus } from '@prisma/client';
export declare class UpdateCopyTradeDto {
    status?: CopyTradeStatus;
    exitPrice?: number;
    profitAmount?: number;
}
