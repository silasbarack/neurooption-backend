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
exports.IndicatorsController = void 0;
const common_1 = require("@nestjs/common");
const indicators_service_1 = require("./indicators.service");
const indicator_query_dto_1 = require("./dto/indicator-query.dto");
let IndicatorsController = class IndicatorsController {
    constructor(indicatorsService) {
        this.indicatorsService = indicatorsService;
    }
    listIndicators() {
        return this.indicatorsService.listIndicators();
    }
    calculate(query) {
        return this.indicatorsService.calculate(query);
    }
};
exports.IndicatorsController = IndicatorsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], IndicatorsController.prototype, "listIndicators", null);
__decorate([
    (0, common_1.Get)('calculate'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [indicator_query_dto_1.IndicatorQueryDto]),
    __metadata("design:returntype", void 0)
], IndicatorsController.prototype, "calculate", null);
exports.IndicatorsController = IndicatorsController = __decorate([
    (0, common_1.Controller)('indicators'),
    __metadata("design:paramtypes", [indicators_service_1.IndicatorsService])
], IndicatorsController);
//# sourceMappingURL=indicators.controller.js.map