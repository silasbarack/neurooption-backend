"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecaptchaService = void 0;
const common_1 = require("@nestjs/common");
let RecaptchaService = class RecaptchaService {
    getPublicConfig() {
        const enabled = process.env.RECAPTCHA_ENABLED === 'true';
        return { enabled, siteKey: enabled ? (process.env.RECAPTCHA_SITE_KEY || '') : '', version: 'v2' };
    }
    getTestConfig() {
        const available = process.env.RECAPTCHA_TEST_ENABLED === 'true' &&
            process.env.RECAPTCHA_VERSION === 'v2' &&
            Boolean(process.env.RECAPTCHA_SITE_KEY && process.env.RECAPTCHA_SECRET_KEY);
        return { available, siteKey: available ? process.env.RECAPTCHA_SITE_KEY : '', version: 'v2' };
    }
    async verifyTest(token) {
        if (process.env.RECAPTCHA_TEST_ENABLED !== 'true') {
            throw new common_1.ServiceUnavailableException('Verification test is not enabled.');
        }
        if (process.env.RECAPTCHA_VERSION !== 'v2' ||
            !process.env.RECAPTCHA_SITE_KEY || !process.env.RECAPTCHA_SECRET_KEY) {
            throw new common_1.ServiceUnavailableException('Verification test keys are not configured.');
        }
        if (!token || token.length > 4096) {
            return { verified: false, code: 'missing-or-invalid-token' };
        }
        let response;
        try {
            const upstream = await fetch('https://www.google.com/recaptcha/api/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET_KEY.trim(), response: token }).toString(),
                signal: AbortSignal.timeout(7000),
            });
            if (!upstream.ok)
                throw new Error('Google siteverify error');
            response = await upstream.json();
        }
        catch {
            throw new common_1.ServiceUnavailableException('Google verification service is unavailable.');
        }
        const hosts = (process.env.RECAPTCHA_ALLOWED_HOSTNAMES ||
            'neurooption.com,www.neurooption.com,neurooption-frontend.onrender.com')
            .split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
        if (response.success && response.hostname && hosts.includes(response.hostname.toLowerCase())) {
            return { verified: true, code: 'verified' };
        }
        const allowedCodes = [
            'missing-input-secret', 'invalid-input-secret', 'missing-input-response',
            'invalid-input-response', 'bad-request', 'timeout-or-duplicate',
        ];
        const code = response.success ? 'hostname-mismatch' :
            (response['error-codes'] || []).find(x => allowedCodes.includes(x)) || 'not-verified';
        return { verified: false, code };
    }
    async verifyDiagnostic(token) {
        const secret = process.env.RECAPTCHA_SECRET_KEY?.trim();
        const key = process.env.RECAPTCHA_SITE_KEY?.trim();
        if (!secret || !key || process.env.RECAPTCHA_VERSION !== 'v2') {
            return { success: false, reason: 'server-not-configured' };
        }
        if (!token || token.length > 4096) {
            return { success: false, reason: 'missing-or-invalid-token' };
        }
        try {
            const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ secret, response: token }).toString(),
                signal: AbortSignal.timeout(7000),
            });
            if (!response.ok)
                return { success: false, reason: 'google-service-unavailable' };
            const result = await response.json();
            const hosts = (process.env.RECAPTCHA_ALLOWED_HOSTNAMES ||
                'neurooption.com,www.neurooption.com,neurooption-frontend.onrender.com')
                .split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
            if (result.success !== true) {
                const reason = result['error-codes']?.[0] || 'google-rejected';
                return { success: false, reason };
            }
            if (!result.hostname || !hosts.includes(result.hostname.toLowerCase())) {
                return { success: false, reason: 'hostname-mismatch' };
            }
            return { success: true, reason: 'verified' };
        }
        catch {
            return { success: false, reason: 'verification-unavailable' };
        }
    }
    async verify(token, _expectedAction) {
        if (process.env.RECAPTCHA_ENABLED !== 'true')
            return;
        const secret = process.env.RECAPTCHA_SECRET_KEY?.trim();
        const siteKey = process.env.RECAPTCHA_SITE_KEY?.trim();
        if (!secret || !siteKey || process.env.RECAPTCHA_VERSION !== 'v2') {
            throw new common_1.ServiceUnavailableException('reCAPTCHA v2 is not configured.');
        }
        if (!token || token.length > 4096) {
            throw new common_1.ForbiddenException('Complete the I\'m not a robot check before continuing.');
        }
        let assessment;
        try {
            const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ secret, response: token }).toString(),
                signal: AbortSignal.timeout(7000),
            });
            if (!response.ok)
                throw new Error('Google verification unavailable');
            assessment = await response.json();
        }
        catch {
            throw new common_1.ServiceUnavailableException('Security verification unavailable. Please retry.');
        }
        const hosts = (process.env.RECAPTCHA_ALLOWED_HOSTNAMES ||
            'neurooption.com,www.neurooption.com,neurooption-frontend.onrender.com')
            .split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
        if (process.env.NODE_ENV !== 'production')
            hosts.push('localhost', '127.0.0.1');
        if (assessment.success !== true) {
            console.warn('[RecaptchaService] Google verification rejected:', (assessment['error-codes'] || []).join(','));
        }
        if (assessment.success !== true || !assessment.hostname ||
            !hosts.includes(assessment.hostname.toLowerCase())) {
            throw new common_1.ForbiddenException('Security verification failed or expired. Please retry.');
        }
    }
};
exports.RecaptchaService = RecaptchaService;
exports.RecaptchaService = RecaptchaService = __decorate([
    (0, common_1.Injectable)()
], RecaptchaService);
//# sourceMappingURL=recaptcha.service.js.map