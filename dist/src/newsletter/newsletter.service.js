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
var NewsletterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsletterService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const prisma_service_1 = require("../config/prisma.service");
const emails_service_1 = require("../emails/emails.service");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
let NewsletterService = NewsletterService_1 = class NewsletterService {
    constructor(prisma, emails) {
        this.prisma = prisma;
        this.emails = emails;
        this.logger = new common_1.Logger(NewsletterService_1.name);
        this.attempts = new Map();
    }
    throttle(key) {
        const now = Date.now();
        const prior = this.attempts.get(key);
        const bucket = prior && now - prior.since < WINDOW_MS ? prior : { count: 0, since: now };
        if (bucket.count >= MAX_PER_WINDOW) {
            throw new common_1.HttpException('Too many attempts. Please try again in a minute.', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        bucket.count += 1;
        this.attempts.set(key, bucket);
        if (this.attempts.size > 5000)
            this.attempts.clear();
    }
    async subscribe(body, ip) {
        this.throttle(ip || 'unknown');
        const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
        if (!EMAIL_RE.test(email) || email.length > 254)
            throw new common_1.BadRequestException('Enter a valid email address.');
        const source = typeof body?.source === 'string' ? body.source.slice(0, 40) : null;
        const existing = await this.prisma.newsletterSubscriber.findUnique({ where: { email } });
        let token = null;
        if (!existing) {
            token = (0, node_crypto_1.randomBytes)(24).toString('base64url');
            await this.prisma.newsletterSubscriber.create({ data: { email, source, unsubscribeToken: token } });
        }
        else if (existing.unsubscribedAt) {
            token = existing.unsubscribeToken;
            await this.prisma.newsletterSubscriber.update({ where: { email }, data: { unsubscribedAt: null, source } });
        }
        if (token) {
            void this.emails.sendNewsletterWelcomeEmail(email, token).catch((error) => {
                this.logger.warn(`Newsletter confirmation not sent: ${error instanceof Error ? error.message : error}`);
            });
        }
        return { success: true, message: "You're subscribed. Check your inbox for a confirmation." };
    }
    async unsubscribe(body) {
        const token = typeof body?.token === 'string' ? body.token.trim() : '';
        if (token.length < 16 || token.length > 100)
            throw new common_1.BadRequestException('This unsubscribe link is not valid.');
        const result = await this.prisma.newsletterSubscriber.updateMany({
            where: { unsubscribeToken: token, unsubscribedAt: null },
            data: { unsubscribedAt: new Date() },
        });
        if (result.count === 0) {
            const known = await this.prisma.newsletterSubscriber.findUnique({ where: { unsubscribeToken: token }, select: { id: true } });
            if (!known)
                throw new common_1.BadRequestException('This unsubscribe link is not valid.');
        }
        return { success: true, message: 'You have been unsubscribed from NeuroOption updates.' };
    }
};
exports.NewsletterService = NewsletterService;
exports.NewsletterService = NewsletterService = NewsletterService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        emails_service_1.EmailsService])
], NewsletterService);
//# sourceMappingURL=newsletter.service.js.map