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
exports.OtcMarketsController = void 0;
const common_1 = require("@nestjs/common");
const create_otc_symbol_dto_1 = require("./dto/create-otc-symbol.dto");
const update_otc_symbol_dto_1 = require("./dto/update-otc-symbol.dto");
const otc_markets_service_1 = require("./otc-markets.service");
let OtcMarketsController = class OtcMarketsController {
    constructor(otcMarketsService) {
        this.otcMarketsService = otcMarketsService;
    }
    create(dto) {
        return this.otcMarketsService.create(dto);
    }
    findAll() {
        return this.otcMarketsService.findAll();
    }
    findActive() {
        return this.otcMarketsService.findActive();
    }
    findOne(symbol) {
        return this.otcMarketsService.findOne(symbol);
    }
    update(symbol, dto) {
        return this.otcMarketsService.update(symbol, dto);
    }
    remove(symbol) {
        return this.otcMarketsService.remove(symbol);
    }
};
exports.OtcMarketsController = OtcMarketsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_otc_symbol_dto_1.CreateOtcSymbolDto]),
    __metadata("design:returntype", void 0)
], OtcMarketsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OtcMarketsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OtcMarketsController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)(':symbol'),
    __param(0, (0, common_1.Param)('symbol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OtcMarketsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':symbol'),
    __param(0, (0, common_1.Param)('symbol')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_otc_symbol_dto_1.UpdateOtcSymbolDto]),
    __metadata("design:returntype", void 0)
], OtcMarketsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':symbol'),
    __param(0, (0, common_1.Param)('symbol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OtcMarketsController.prototype, "remove", null);
exports.OtcMarketsController = OtcMarketsController = __decorate([
    (0, common_1.Controller)('otc-markets'),
    __metadata("design:paramtypes", [otc_markets_service_1.OtcMarketsService])
], OtcMarketsController);
//# sourceMappingURL=otc-markets.controller.js.map