import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private _admin;
    get admin(): any;
    set admin(value: any);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
