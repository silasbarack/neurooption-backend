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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../config/prisma.service");
const emails_service_1 = require("../emails/emails.service");
let KycService = class KycService {
    constructor(prisma, emails) {
        this.prisma = prisma;
        this.emails = emails;
    }
    async notify(userId, recordId, status, reason) {
        if (!this.emails)
            return;
        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true, fullName: true, status: true } });
        if (!user || user.status === 'DELETED')
            return;
        const options = { userId, dedupeKey: `kyc-${status.toLowerCase()}:${recordId}` };
        try {
            if (status === 'SUBMITTED')
                await this.emails.sendKycSubmittedEmail(user.email, user.fullName, options);
            else if (status === 'APPROVED')
                await this.emails.sendKycApprovedEmail(user.email, user.fullName, options);
            else
                await this.emails.sendKycRejectedEmail(user.email, user.fullName, reason || 'The documents could not be verified.', options);
        }
        catch {
        }
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
        const record = await this.prisma.kycRecord.create({
            data: {
                userId: dto.userId,
                documentType: dto.documentType,
                documentNumber: dto.documentNumber,
            },
        });
        await this.notify(dto.userId, record.id, 'SUBMITTED');
        return record;
    }
    async findAll() {
        return this.prisma.kycRecord.findMany({
            include: {
                user: { select: { id: true, fullName: true, email: true, status: true, kycStatus: true } },
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
                user: { select: { id: true, fullName: true, email: true, status: true, kycStatus: true } },
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
        await this.notify(record.userId, id, 'APPROVED');
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
        await this.notify(record.userId, id, 'REJECTED', dto.rejectionReason);
        return updated;
    }
    async pending() {
        return this.prisma.kycRecord.findMany({
            where: {
                status: 'PENDING',
            },
            include: {
                user: { select: { id: true, fullName: true, email: true, status: true, kycStatus: true } },
            },
        });
    }
};
exports.KycService = KycService;
exports.KycService = KycService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        emails_service_1.EmailsService])
], KycService);
//# sourceMappingURL=kyc.service.js.map