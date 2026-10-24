"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeframesService = void 0;
const common_1 = require("@nestjs/common");
const create_timeframe_dto_1 = require("./dto/create-timeframe.dto");
let TimeframesService = class TimeframesService {
    constructor() {
        this.timeframes = [
            this.buildTimeframe(create_timeframe_dto_1.TimeframeCode.S5),
            this.buildTimeframe(create_timeframe_dto_1.TimeframeCode.S10),
            this.buildTimeframe(create_timeframe_dto_1.TimeframeCode.S15),
            this.buildTimeframe(create_timeframe_dto_1.TimeframeCode.S30),
            this.buildTimeframe(create_timeframe_dto_1.TimeframeCode.M1),
            this.buildTimeframe(create_timeframe_dto_1.TimeframeCode.M2),
            this.buildTimeframe(create_timeframe_dto_1.TimeframeCode.M3),
            this.buildTimeframe(create_timeframe_dto_1.TimeframeCode.M5),
            this.buildTimeframe(create_timeframe_dto_1.TimeframeCode.M10),
            this.buildTimeframe(create_timeframe_dto_1.TimeframeCode.M15),
            this.buildTimeframe(create_timeframe_dto_1.TimeframeCode.M30),
            this.buildTimeframe(create_timeframe_dto_1.TimeframeCode.H1),
            this.buildTimeframe(create_timeframe_dto_1.TimeframeCode.H4),
            this.buildTimeframe(create_timeframe_dto_1.TimeframeCode.D1),
        ];
    }
    create(dto) {
        const exists = this.timeframes.find((item) => item.code === dto.code);
        if (exists) {
            throw new common_1.BadRequestException('Timeframe already exists');
        }
        const timeframe = {
            ...this.buildTimeframe(dto.code),
            isActive: dto.isActive ?? true,
        };
        this.timeframes.push(timeframe);
        return timeframe;
    }
    findAll() {
        return this.timeframes;
    }
    findActive() {
        return this.timeframes.filter((item) => item.isActive);
    }
    findOne(code) {
        const timeframe = this.timeframes.find((item) => item.code === code);
        if (!timeframe) {
            throw new common_1.NotFoundException('Timeframe not found');
        }
        return timeframe;
    }
    update(code, dto) {
        const timeframe = this.findOne(code);
        if (dto.isActive !== undefined) {
            timeframe.isActive = dto.isActive;
        }
        return timeframe;
    }
    remove(code) {
        const timeframe = this.findOne(code);
        this.timeframes = this.timeframes.filter((item) => item.code !== code);
        return timeframe;
    }
    buildTimeframe(code) {
        return {
            id: crypto.randomUUID(),
            code,
            seconds: this.toSeconds(code),
            label: this.toLabel(code),
            isActive: true,
        };
    }
    toSeconds(code) {
        const value = Number(code.slice(1));
        if (code.startsWith('S'))
            return value;
        if (code.startsWith('M'))
            return value * 60;
        if (code.startsWith('H'))
            return value * 60 * 60;
        if (code.startsWith('D'))
            return value * 24 * 60 * 60;
        throw new common_1.BadRequestException('Invalid timeframe code');
    }
    toLabel(code) {
        const value = Number(code.slice(1));
        if (code.startsWith('S'))
            return `${value} seconds`;
        if (code.startsWith('M'))
            return `${value} minutes`;
        if (code.startsWith('H'))
            return `${value} hours`;
        if (code.startsWith('D'))
            return `${value} day`;
        throw new common_1.BadRequestException('Invalid timeframe code');
    }
};
exports.TimeframesService = TimeframesService;
exports.TimeframesService = TimeframesService = __decorate([
    (0, common_1.Injectable)()
], TimeframesService);
//# sourceMappingURL=timeframes.service.js.map