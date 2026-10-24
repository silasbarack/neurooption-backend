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
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../config/prisma.service");
const withdrawals_service_1 = require("../withdrawals/withdrawals.service");
const mpesa_service_1 = require("./mpesa.service");
const CURRENCY = 'KES';
let FinanceService = class FinanceService {
    constructor(prisma, withdrawalsService, mpesa) {
        this.prisma = prisma;
        this.withdrawalsService = withdrawalsService;
        this.mpesa = mpesa;
    }
    async overview(userId) {
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId_currency: { userId, currency: CURRENCY } },
        });
        const transactions = await this.prisma.transaction.findMany({
            where: {
                userId,
                type: { in: [client_1.TransactionType.DEPOSIT, client_1.TransactionType.WITHDRAWAL] },
            },
            include: {
                deposit: { include: { gateway: { select: { type: true } } } },
                withdrawal: { include: { gateway: { select: { type: true } } } },
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        return {
            wallet: {
                currency: CURRENCY,
                balance: wallet ? Number(wallet.balance) : 0,
                locked: wallet ? Number(wallet.locked) : 0,
            },
            mpesa: this.mpesa.configSummary(),
            transactions: transactions.map((t) => {
                const payment = t.deposit ?? t.withdrawal;
                return {
                    id: t.id,
                    type: t.type === client_1.TransactionType.DEPOSIT ? 'Deposit' : 'Withdrawal',
                    method: gatewayLabel(payment?.gateway?.type),
                    amount: Number(t.amount),
                    currency: payment?.currency ?? CURRENCY,
                    status: t.status,
                    phone: payment?.phone ? maskPhone(payment.phone) : null,
                    reference: t.status === 'COMPLETED' ? payment?.externalRef ?? null : null,
                    createdAt: t.createdAt,
                };
            }),
        };
    }
    async requestWithdrawal(userId, phone, amount) {
        const normalizedPhone = this.mpesa.normalizePhone(phone);
        const wallet = await this.prisma.wallet.upsert({
            where: { userId_currency: { userId, currency: CURRENCY } },
            update: {},
            create: { userId, currency: CURRENCY },
        });
        await this.prisma.paymentGateway.upsert({
            where: {
                type_direction: {
                    type: client_1.PaymentGatewayType.MPESA,
                    direction: client_1.PaymentDirection.OUT,
                },
            },
            update: {},
            create: {
                name: 'M-Pesa',
                type: client_1.PaymentGatewayType.MPESA,
                direction: client_1.PaymentDirection.OUT,
            },
        });
        const withdrawal = await this.withdrawalsService.create({
            userId,
            walletId: wallet.id,
            gatewayType: client_1.PaymentGatewayType.MPESA,
            amount: Math.round(Number(amount) * 100) / 100,
            currency: CURRENCY,
            phone: normalizedPhone,
        });
        return {
            id: withdrawal.id,
            status: withdrawal.status,
            amount: Number(withdrawal.amount),
            currency: CURRENCY,
            message: 'Withdrawal requested. It will be reviewed and paid to your M-Pesa.',
        };
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        withdrawals_service_1.WithdrawalsService,
        mpesa_service_1.MpesaService])
], FinanceService);
function gatewayLabel(type) {
    switch (type) {
        case client_1.PaymentGatewayType.MPESA:
            return 'M-Pesa';
        case client_1.PaymentGatewayType.AIRTEL_MONEY:
            return 'Airtel Money';
        case client_1.PaymentGatewayType.BINANCE_PAY:
            return 'Binance Pay';
        case client_1.PaymentGatewayType.TKASH:
            return 'T-Kash';
        case client_1.PaymentGatewayType.EQUITEL:
            return 'Equitel';
        default:
            return 'Manual';
    }
}
function maskPhone(phone) {
    return phone.length > 6 ? `${phone.slice(0, 6)}***${phone.slice(-2)}` : phone;
}
//# sourceMappingURL=finance.service.js.map