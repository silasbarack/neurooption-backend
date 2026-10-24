"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGatewaysService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../config/prisma.service");
let PaymentGatewaysService = class PaymentGatewaysService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const exists = await this.prisma.paymentGateway.findUnique({
            where: {
                type_direction: {
                    type: dto.type,
                    direction: dto.direction,
                },
            },
        });
        if (exists) {
            throw new common_1.ConflictException('Payment gateway already exists');
        }
        return this.prisma.paymentGateway.create({
            data: {
                name: dto.name,
                type: dto.type,
                direction: dto.direction,
                isActive: dto.isActive ?? true,
                publicKey: dto.publicKey,
                secretKey: dto.secretKey,
                callbackUrl: dto.callbackUrl,
            },
        });
    }
    async findAll() {
        return this.prisma.paymentGateway.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async findActive() {
        return this.prisma.paymentGateway.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByType(type) {
        return this.prisma.paymentGateway.findMany({
            where: { type },
        });
    }
    async findForDeposit(type) {
        const gateway = await this.prisma.paymentGateway.findUnique({
            where: {
                type_direction: {
                    type,
                    direction: client_1.PaymentDirection.IN,
                },
            },
        });
        if (!gateway) {
            throw new common_1.NotFoundException('Deposit gateway not found');
        }
        return gateway;
    }
    async findForWithdrawal(type) {
        const gateway = await this.prisma.paymentGateway.findUnique({
            where: {
                type_direction: {
                    type,
                    direction: client_1.PaymentDirection.OUT,
                },
            },
        });
        if (!gateway) {
            throw new common_1.NotFoundException('Withdrawal gateway not found');
        }
        return gateway;
    }
    async findOne(id) {
        const gateway = await this.prisma.paymentGateway.findUnique({
            where: { id },
        });
        if (!gateway) {
            throw new common_1.NotFoundException('Payment gateway not found');
        }
        return gateway;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.paymentGateway.update({
            where: { id },
            data: dto,
        });
    }
    async enable(id) {
        return this.prisma.paymentGateway.update({
            where: { id },
            data: { isActive: true },
        });
    }
    async disable(id) {
        return this.prisma.paymentGateway.update({
            where: { id },
            data: { isActive: false },
        });
    }
};
exports.PaymentGatewaysService = PaymentGatewaysService;
exports.PaymentGatewaysService = PaymentGatewaysService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentGatewaysService);
//# sourceMappingURL=payment-gateways.service.js.map