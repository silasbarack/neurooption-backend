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
var MpesaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MpesaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../config/prisma.service");
const deposits_service_1 = require("../deposits/deposits.service");
const SANDBOX_SHORTCODE = '174379';
const SANDBOX_PASSKEY = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
const DARAJA_TIMEOUT_MS = 20_000;
const QUERY_AFTER_MS = 15_000;
const MAX_STK_AMOUNT = 150_000;
const DEPOSIT_CURRENCY = 'KES';
let MpesaService = MpesaService_1 = class MpesaService {
    constructor(prisma, depositsService) {
        this.prisma = prisma;
        this.depositsService = depositsService;
        this.logger = new common_1.Logger(MpesaService_1.name);
        this.token = null;
    }
    env(name) {
        return (process.env[name] || '').trim();
    }
    get environment() {
        return this.env('MPESA_ENV').toLowerCase() === 'production'
            ? 'production'
            : 'sandbox';
    }
    get baseUrl() {
        return this.environment === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';
    }
    get shortcode() {
        return (this.env('MPESA_SHORTCODE') ||
            (this.environment === 'sandbox' ? SANDBOX_SHORTCODE : ''));
    }
    get passkey() {
        return (this.env('MPESA_PASSKEY') ||
            (this.environment === 'sandbox' ? SANDBOX_PASSKEY : ''));
    }
    get transactionType() {
        return this.env('MPESA_TRANSACTION_TYPE') === 'CustomerBuyGoodsOnline'
            ? 'CustomerBuyGoodsOnline'
            : 'CustomerPayBillOnline';
    }
    get partyB() {
        return this.env('MPESA_PARTY_B') || this.shortcode;
    }
    get callbackToken() {
        return (this.env('MPESA_CALLBACK_TOKEN') ||
            (0, crypto_1.createHash)('sha256')
                .update(`${process.env.JWT_SECRET || 'dev_secret'}:stk-callback`)
                .digest('hex')
                .slice(0, 32));
    }
    get callbackUrl() {
        const base = (this.env('BACKEND_PUBLIC_URL') || 'https://neurooption-backend.onrender.com').replace(/\/+$/, '');
        return `${base}/payments/stk/callback/${this.callbackToken}`;
    }
    isConfigured() {
        return Boolean(this.env('MPESA_CONSUMER_KEY') &&
            this.env('MPESA_CONSUMER_SECRET') &&
            this.shortcode &&
            this.passkey);
    }
    configSummary() {
        return {
            configured: this.isConfigured(),
            environment: this.environment,
            shortcode: this.shortcode || null,
            transactionType: this.transactionType,
            minAmount: this.minAmount,
            maxAmount: MAX_STK_AMOUNT,
        };
    }
    get minAmount() {
        const value = Number(this.env('MPESA_MIN_AMOUNT') || 1);
        return Number.isFinite(value) && value >= 1 ? Math.floor(value) : 1;
    }
    async fetchJson(url, init) {
        const response = await fetch(url, {
            ...init,
            signal: AbortSignal.timeout(DARAJA_TIMEOUT_MS),
        });
        const text = await response.text();
        let body;
        try {
            body = (text ? JSON.parse(text) : {});
        }
        catch {
            body = { errorMessage: text.slice(0, 300) };
        }
        return { ok: response.ok, status: response.status, body };
    }
    async getAccessToken() {
        if (this.token && this.token.expiresAt > Date.now() + 60_000) {
            return this.token.value;
        }
        const credentials = Buffer.from(`${this.env('MPESA_CONSUMER_KEY')}:${this.env('MPESA_CONSUMER_SECRET')}`).toString('base64');
        const { ok, status, body } = await this.fetchJson(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
            method: 'GET',
            headers: { Authorization: `Basic ${credentials}` },
        });
        if (!ok || !body.access_token) {
            this.logger.error(`Daraja OAuth failed (HTTP ${status}): ${body.errorMessage || 'no access token'}`);
            throw new common_1.BadGatewayException('Could not connect to M-Pesa. Please try again shortly.');
        }
        const ttlSeconds = Number(body.expires_in) || 3599;
        this.token = {
            value: body.access_token,
            expiresAt: Date.now() + ttlSeconds * 1000,
        };
        return this.token.value;
    }
    timestamp(date = new Date()) {
        const eat = new Date(date.getTime() + 3 * 60 * 60 * 1000);
        return eat.toISOString().replace(/[-:T]/g, '').slice(0, 14);
    }
    password(timestamp) {
        return Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');
    }
    normalizePhone(input) {
        const digits = String(input || '').replace(/\D/g, '');
        let phone = digits;
        if (/^0[17]\d{8}$/.test(digits))
            phone = `254${digits.slice(1)}`;
        else if (/^[17]\d{8}$/.test(digits))
            phone = `254${digits}`;
        if (!/^254[17]\d{8}$/.test(phone)) {
            throw new common_1.BadRequestException('Enter a valid Safaricom number, e.g. 0712 345 678.');
        }
        return phone;
    }
    async queryStk(checkoutRequestId) {
        try {
            const token = await this.getAccessToken();
            const timestamp = this.timestamp();
            const { body } = await this.fetchJson(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    BusinessShortCode: this.shortcode,
                    Password: this.password(timestamp),
                    Timestamp: timestamp,
                    CheckoutRequestID: checkoutRequestId,
                }),
            });
            if (body.ResultCode !== undefined && body.ResultCode !== null) {
                const code = String(body.ResultCode);
                return {
                    outcome: code === '0' ? 'paid' : 'failed',
                    resultCode: code,
                    resultDesc: body.ResultDesc,
                };
            }
            if (body.errorCode === '500.001.1001') {
                return { outcome: 'pending', resultDesc: body.errorMessage };
            }
            return { outcome: 'unknown', resultDesc: body.errorMessage };
        }
        catch (error) {
            this.logger.warn(`STK query failed for ${checkoutRequestId}: ${error instanceof Error ? error.message : error}`);
            return { outcome: 'unknown' };
        }
    }
    async ensureDepositSetup(userId) {
        const wallet = await this.prisma.wallet.upsert({
            where: { userId_currency: { userId, currency: DEPOSIT_CURRENCY } },
            update: {},
            create: { userId, currency: DEPOSIT_CURRENCY },
        });
        const gateway = await this.prisma.paymentGateway.upsert({
            where: {
                type_direction: {
                    type: client_1.PaymentGatewayType.MPESA,
                    direction: client_1.PaymentDirection.IN,
                },
            },
            update: {},
            create: {
                name: 'M-Pesa',
                type: client_1.PaymentGatewayType.MPESA,
                direction: client_1.PaymentDirection.IN,
                environment: this.environment,
                shortcode: this.shortcode,
                callbackUrl: this.callbackUrl,
            },
        });
        if (!gateway.isActive) {
            throw new common_1.ServiceUnavailableException('M-Pesa deposits are temporarily unavailable.');
        }
        return wallet;
    }
    async startDeposit(userId, phoneInput, amountInput) {
        if (!this.isConfigured()) {
            throw new common_1.ServiceUnavailableException('M-Pesa deposits are not set up yet. Please try again later.');
        }
        const phone = this.normalizePhone(phoneInput);
        const amount = Math.round(Number(amountInput));
        if (!Number.isFinite(amount) || amount < this.minAmount) {
            throw new common_1.BadRequestException(`The minimum M-Pesa deposit is KES ${this.minAmount}.`);
        }
        if (amount > MAX_STK_AMOUNT) {
            throw new common_1.BadRequestException(`The maximum M-Pesa deposit is KES ${MAX_STK_AMOUNT.toLocaleString('en-KE')}.`);
        }
        const wallet = await this.ensureDepositSetup(userId);
        const deposit = await this.depositsService.create({
            userId,
            walletId: wallet.id,
            gatewayType: client_1.PaymentGatewayType.MPESA,
            amount,
            currency: DEPOSIT_CURRENCY,
            phone,
        });
        const timestamp = this.timestamp();
        let response;
        try {
            const token = await this.getAccessToken();
            const result = await this.fetchJson(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    BusinessShortCode: this.shortcode,
                    Password: this.password(timestamp),
                    Timestamp: timestamp,
                    TransactionType: this.transactionType,
                    Amount: amount,
                    PartyA: phone,
                    PartyB: this.partyB,
                    PhoneNumber: phone,
                    CallBackURL: this.callbackUrl,
                    AccountReference: (this.env('MPESA_ACCOUNT_REFERENCE') || 'NeuroOption').slice(0, 12),
                    TransactionDesc: 'Deposit',
                }),
            });
            response = result.body;
        }
        catch (error) {
            await this.failDeposit(deposit.id, 'Could not reach M-Pesa');
            throw error instanceof common_1.BadGatewayException
                ? error
                : new common_1.BadGatewayException('Could not reach M-Pesa. Please try again.');
        }
        if (response.ResponseCode !== '0' || !response.CheckoutRequestID) {
            const reason = response.errorMessage || response.ResponseDescription || 'STK push rejected';
            this.logger.warn(`STK push rejected for deposit ${deposit.id}: ${reason}`);
            await this.failDeposit(deposit.id, reason);
            throw new common_1.BadRequestException(`M-Pesa could not start the payment: ${reason}`);
        }
        await this.prisma.deposit.update({
            where: { id: deposit.id },
            data: {
                checkoutId: response.CheckoutRequestID,
                gatewayRaw: { stkPush: response },
            },
        });
        this.logger.log(`STK push sent for deposit ${deposit.id} (KES ${amount} to ${phone.slice(0, 6)}***)`);
        return {
            depositId: deposit.id,
            status: client_1.TransactionStatus.PENDING,
            amount,
            currency: DEPOSIT_CURRENCY,
            phone,
            message: response.CustomerMessage ||
                'Check your phone and enter your M-Pesa PIN to complete the deposit.',
        };
    }
    async getDepositStatus(userId, depositId) {
        let deposit = await this.prisma.deposit.findUnique({
            where: { id: depositId },
        });
        if (!deposit)
            throw new common_1.NotFoundException('Deposit not found');
        if (deposit.userId !== userId)
            throw new common_1.ForbiddenException();
        if (deposit.status === client_1.TransactionStatus.PENDING &&
            deposit.checkoutId &&
            Date.now() - deposit.createdAt.getTime() > QUERY_AFTER_MS) {
            const query = await this.queryStk(deposit.checkoutId);
            if (query.outcome === 'paid') {
                await this.completeDeposit(deposit.id, deposit.checkoutId);
            }
            else if (query.outcome === 'failed') {
                await this.failDeposit(deposit.id, query.resultDesc || 'Payment not completed');
            }
            deposit = await this.prisma.deposit.findUnique({ where: { id: depositId } });
        }
        return this.toStatus(deposit);
    }
    async handleCallback(body) {
        const callback = body?.Body?.stkCallback;
        const checkoutId = callback?.CheckoutRequestID;
        if (!checkoutId)
            return;
        const deposit = await this.prisma.deposit.findFirst({
            where: { checkoutId },
        });
        if (!deposit) {
            this.logger.warn(`STK callback for unknown checkout ${checkoutId}`);
            return;
        }
        const items = callback.CallbackMetadata?.Item ?? [];
        const item = (name) => items.find((i) => i.Name === name)?.Value;
        const receipt = item('MpesaReceiptNumber');
        const paidAmount = Number(item('Amount'));
        await this.prisma.deposit.update({
            where: { id: deposit.id },
            data: {
                gatewayRaw: {
                    ...(deposit.gatewayRaw || {}),
                    callback,
                },
            },
        });
        if (deposit.status !== client_1.TransactionStatus.PENDING)
            return;
        if (String(callback.ResultCode) !== '0') {
            await this.failDeposit(deposit.id, callback.ResultDesc || 'Payment not completed');
            return;
        }
        const query = await this.queryStk(checkoutId);
        if (query.outcome !== 'paid') {
            this.logger.warn(`Callback for deposit ${deposit.id} reported success but query returned ${query.outcome}; leaving pending.`);
            return;
        }
        if (Number.isFinite(paidAmount) && paidAmount !== Number(deposit.amount)) {
            this.logger.error(`Deposit ${deposit.id} amount mismatch: expected ${deposit.amount}, paid ${paidAmount}. Needs manual review.`);
            await this.failDeposit(deposit.id, 'Amount mismatch, under review');
            return;
        }
        await this.completeDeposit(deposit.id, receipt ? String(receipt) : checkoutId);
    }
    async completeDeposit(depositId, externalRef) {
        const claim = await this.prisma.deposit.updateMany({
            where: { id: depositId, status: client_1.TransactionStatus.PENDING },
            data: { status: client_1.TransactionStatus.PROCESSING },
        });
        if (claim.count === 0)
            return;
        try {
            await this.depositsService.markCompleted(depositId, externalRef);
            this.logger.log(`Deposit ${depositId} completed (${externalRef}).`);
        }
        catch (error) {
            this.logger.error(`Crediting deposit ${depositId} failed: ${error instanceof Error ? error.message : error}`);
            await this.prisma.deposit.update({
                where: { id: depositId },
                data: { status: client_1.TransactionStatus.PENDING },
            });
            throw error;
        }
    }
    async failDeposit(depositId, reason) {
        const claim = await this.prisma.deposit.updateMany({
            where: { id: depositId, status: client_1.TransactionStatus.PENDING },
            data: { status: client_1.TransactionStatus.PROCESSING },
        });
        if (claim.count === 0)
            return;
        await this.depositsService.markFailed(depositId, reason.slice(0, 180));
    }
    toStatus(deposit) {
        const messages = {
            PENDING: 'Waiting for you to enter your M-Pesa PIN…',
            PROCESSING: 'Confirming your payment…',
            COMPLETED: 'Deposit received. Your balance has been updated.',
            FAILED: deposit.externalRef || 'The payment was not completed.',
            CANCELLED: 'The payment was cancelled.',
        };
        return {
            depositId: deposit.id,
            status: deposit.status,
            amount: Number(deposit.amount),
            currency: deposit.currency,
            phone: deposit.phone,
            receipt: deposit.status === client_1.TransactionStatus.COMPLETED ? deposit.externalRef : null,
            message: messages[deposit.status] || '',
        };
    }
};
exports.MpesaService = MpesaService;
exports.MpesaService = MpesaService = MpesaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        deposits_service_1.DepositsService])
], MpesaService);
//# sourceMappingURL=mpesa.service.js.map