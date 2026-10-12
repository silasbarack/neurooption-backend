import { PrismaService } from '../config/prisma.service';
type FilterInput = {
    account?: string;
    status?: string;
    search?: string;
    page?: string;
    limit?: string;
};
export declare class TradingMonitorService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    overview(query: FilterInput): Promise<{
        generatedAt: string;
        period: string;
        account: string;
        stats: {
            trades24: number;
            openTrades: number;
            volumeUsd24: number;
            wins24: number;
            losses24: number;
            winRate24: number;
            activeClients24: number;
        };
        activity: {
            hour: string;
            trades: number;
            volumeUsd: number;
        }[];
        activitySampled: boolean;
        trades: {
            total: number;
            page: number;
            limit: number;
            pages: number;
            items: {
                id: string;
                userId: string;
                clientName: string;
                clientEmail: string;
                asset: string;
                side: string;
                status: string;
                accountType: string;
                currency: string;
                stakeAmount: number;
                stakeUsd: number;
                payoutPercent: number;
                profitUsd: number;
                entryTime: string;
                expiryTime: string;
            }[];
        };
    }>;
}
export {};
