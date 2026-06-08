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
exports.KycService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../config/prisma.service");
let KycService = class KycService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async submit(dto) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: dto.userId,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.prisma.kycRecord.create({
            data: {
                userId: dto.userId,
                documentType: dto.documentType,
                documentNumber: dto.documentNumber,
            },
        });
    }
    async findAll() {
        return this.prisma.kycRecord.findMany({
            include: {
                user: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id) {
        const record = await this.prisma.kycRecord.findUnique({
            where: { id },
            include: {
                user: true,
            },
        });
        if (!record) {
            throw new common_1.NotFoundException('KYC record not found');
        }
        return record;
    }
    async approve(id, dto) {
        const record = await this.prisma.kycRecord.findUnique({
            where: { id },
        });
        if (!record) {
            throw new common_1.NotFoundException('KYC record not found');
        }
        const updated = await this.prisma.kycRecord.update({
            where: { id },
            data: {
                status: 'APPROVED',
                rejectionReason: null,
            },
        });
        await this.prisma.user.update({
            where: {
                id: record.userId,
            },
            data: {
                kycStatus: 'APPROVED',
            },
        });
        return updated;
    }
    async reject(id, dto) {
        if (!dto.rejectionReason) {
            throw new common_1.BadRequestException('Rejection reason required');
        }
        const record = await this.prisma.kycRecord.findUnique({
            where: { id },
        });
        if (!record) {
            throw new common_1.NotFoundException('KYC record not found');
        }
        const updated = await this.prisma.kycRecord.update({
            where: { id },
            data: {
                status: 'REJECTED',
                rejectionReason: dto.rejectionReason,
            },
        });
        await this.prisma.user.update({
            where: {
                id: record.userId,
            },
            data: {
                kycStatus: 'REJECTED',
            },
        });
        return updated;
    }
    async pending() {
        return this.prisma.kycRecord.findMany({
            where: {
                status: 'PENDING',
            },
            include: {
                user: true,
            },
        });
    }
};
exports.KycService = KycService;
exports.KycService = KycService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KycService);
//# sourceMappingURL=kyc.service.js.map