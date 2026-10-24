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
exports.EmailWebhooksController = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const emails_service_1 = require("./emails.service");
let EmailWebhooksController = class EmailWebhooksController {
    constructor(emails) {
        this.emails = emails;
    }
    async brevo(token, body) {
        const expected = (process.env.BREVO_WEBHOOK_TOKEN || '').trim();
        if (expected.length < 24)
            throw new common_1.NotFoundException();
        const given = Buffer.from(String(token || ''));
        const wanted = Buffer.from(expected);
        if (given.length !== wanted.length || !(0, node_crypto_1.timingSafeEqual)(given, wanted))
            throw new common_1.ForbiddenException();
        const events = (Array.isArray(body) ? body : [body]).slice(0, 100);
        let matched = 0;
        for (const item of events) {
            const event = typeof item?.event === 'string' ? item.event : '';
            const id = typeof item?.['message-id'] === 'string' ? item['message-id'] : typeof item?.messageId === 'string' ? item.messageId : '';
            if (event && id && (await this.emails.applyProviderEvent(event, id.slice(0, 300))))
                matched += 1;
        }
        return { received: events.length, matched };
    }
};
exports.EmailWebhooksController = EmailWebhooksController;
__decorate([
    (0, common_1.Post)('brevo'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Query)('token')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmailWebhooksController.prototype, "brevo", null);
exports.EmailWebhooksController = EmailWebhooksController = __decorate([
    (0, common_1.Controller)('emails/webhooks'),
    __metadata("design:paramtypes", [emails_service_1.EmailsService])
], EmailWebhooksController);
//# sourceMappingURL=email-webhooks.controller.js.map