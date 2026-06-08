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
exports.TimeframesController = void 0;
const common_1 = require("@nestjs/common");
const timeframes_service_1 = require("./timeframes.service");
const create_timeframe_dto_1 = require("./dto/create-timeframe.dto");
const update_timeframe_dto_1 = require("./dto/update-timeframe.dto");
let TimeframesController = class TimeframesController {
    constructor(timeframesService) {
        this.timeframesService = timeframesService;
    }
    create(dto) {
        return this.timeframesService.create(dto);
    }
    findAll() {
        return this.timeframesService.findAll();
    }
    findActive() {
        return this.timeframesService.findActive();
    }
    findOne(code) {
        return this.timeframesService.findOne(code);
    }
    update(code, dto) {
        return this.timeframesService.update(code, dto);
    }
    remove(code) {
        return this.timeframesService.remove(code);
    }
};
exports.TimeframesController = TimeframesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_timeframe_dto_1.CreateTimeframeDto]),
    __metadata("design:returntype", void 0)
], TimeframesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TimeframesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TimeframesController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)(':code'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TimeframesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':code'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_timeframe_dto_1.UpdateTimeframeDto]),
    __metadata("design:returntype", void 0)
], TimeframesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':code'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TimeframesController.prototype, "remove", null);
exports.TimeframesController = TimeframesController = __decorate([
    (0, common_1.Controller)('timeframes'),
    __metadata("design:paramtypes", [timeframes_service_1.TimeframesService])
], TimeframesController);
//# sourceMappingURL=timeframes.controller.js.map