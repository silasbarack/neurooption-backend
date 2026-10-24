import { WalletsService } from './wallets.service';
export declare class WalletsController {
    private readonly walletsService;
    constructor(walletsService: WalletsService);
    getWallets(req: {
        user: {
            id: string;
            role: string;
        };
    }, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        currency: string;
        balance: import("@prisma/client/runtime/library").Decimal;
        locked: import("@prisma/client/runtime/library").Decimal;
        accountType: string;
        balanceUsd: import("@prisma/client/runtime/library").Decimal;
        lockedUsd: import("@prisma/client/runtime/library").Decimal;
    }[]>;
}
