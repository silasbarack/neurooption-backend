"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpiriesService = void 0;
const common_1 = require("@nestjs/common");
let ExpiriesService = class ExpiriesService {
    constructor() {
        this.expiries = [
            this.buildExpiry('00:00:05'),
            this.buildExpiry('00:00:10'),
            this.buildExpiry('00:00:15'),
            this.buildExpiry('00:00:30'),
            this.buildExpiry('00:01:00'),
            this.buildExpiry('00:02:00'),
            this.buildExpiry('00:02:30'),
            this.buildExpiry('00:05:00'),
            this.buildExpiry('00:10:00'),
            this.buildExpiry('00:15:00'),
            this.buildExpiry('00:30:00'),
            this.buildExpiry('01:00:00'),
            this.buildExpiry('02:00:00'),
            this.buildExpiry('05:00:00'),
        ];
    }
    create(dto) {
        const seconds = this.toSeconds(dto.duration);
        if (seconds < 5 || seconds > 18_000) {
            throw new common_1.BadRequestException('Expiry must be between 00:00:05 and 05:00:00');
        }
        const exists = this.expiries.find((item) => item.duration === dto.duration);
        if (exists) {
            throw new common_1.BadRequestException('Expiry already exists');
        }
        const expiry = {
            ...this.buildExpiry(dto.duration),
            isActive: dto.isActive ?? true,
        };
        this.expiries.push(expiry);
        return expiry;
    }
    findAll() {
        return this.expiries;
    }
    findActive() {
        return this.expiries.filter((item) => item.isActive);
    }
    findOne(duration) {
        const expiry = this.expiries.find((item) => item.duration === duration);
        if (!expiry) {
            throw new common_1.NotFoundException('Expiry not found');
        }
        return expiry;
    }
    update(duration, dto) {
        const expiry = this.findOne(duration);
        if (dto.isActive !== undefined) {
            expiry.isActive = dto.isActive;
        }
        return expiry;
    }
    remove(duration) {
        const expiry = this.findOne(duration);
        this.expiries = this.expiries.filter((item) => item.duration !== duration);
        return expiry;
    }
    buildExpiry(duration) {
        return {
            id: crypto.randomUUID(),
            duration,
            seconds: this.toSeconds(duration),
            label: this.toLabel(duration),
            isActive: true,
        };
    }
    toSeconds(duration) {
        const [hours, minutes, seconds] = duration.split(':').map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    }
    toLabel(duration) {
        const [hours, minutes, seconds] = duration.split(':').map(Number);
        const parts = [];
        if (hours > 0)
            parts.push(`${hours}h`);
        if (minutes > 0)
            parts.push(`${minutes}m`);
        if (seconds > 0)
            parts.push(`${seconds}s`);
        return parts.join(' ');
    }
};
exports.ExpiriesService = ExpiriesService;
exports.ExpiriesService = ExpiriesService = __decorate([
    (0, common_1.Injectable)()
], ExpiriesService);
//# sourceMappingURL=expiries.service.js.map