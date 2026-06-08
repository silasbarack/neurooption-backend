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
exports.RealMarketsController = void 0;
const common_1 = require("@nestjs/common");
const create_real_symbol_dto_1 = require("./dto/create-real-symbol.dto");
const update_real_symbol_dto_1 = require("./dto/update-real-symbol.dto");
const real_markets_service_1 = require("./real-markets.service");
let RealMarketsController = class RealMarketsController {
    constructor(realMarketsService) {
        this.realMarketsService = realMarketsService;
    }
    create(dto) {
        return this.realMarketsService.create(dto);
    }
    findAll() {
        return this.realMarketsService.findAll();
    }
    findActive() {
        return this.realMarketsService.findActive();
    }
    findOne(symbol) {
        return this.realMarketsService.findOne(symbol);
    }
    update(symbol, dto) {
        return this.realMarketsService.update(symbol, dto);
    }
    remove(symbol) {
        return this.realMarketsService.remove(symbol);
    }
};
exports.RealMarketsController = RealMarketsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_real_symbol_dto_1.CreateRealSymbolDto]),
    __metadata("design:returntype", void 0)
], RealMarketsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RealMarketsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RealMarketsController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)(':symbol'),
    __param(0, (0, common_1.Param)('symbol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RealMarketsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':symbol'),
    __param(0, (0, common_1.Param)('symbol')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_real_symbol_dto_1.UpdateRealSymbolDto]),
    __metadata("design:returntype", void 0)
], RealMarketsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':symbol'),
    __param(0, (0, common_1.Param)('symbol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RealMarketsController.prototype, "remove", null);
exports.RealMarketsController = RealMarketsController = __decorate([
    (0, common_1.Controller)('real-markets'),
    __metadata("design:paramtypes", [real_markets_service_1.RealMarketsService])
], RealMarketsController);
//# sourceMappingURL=real-markets.controller.js.map