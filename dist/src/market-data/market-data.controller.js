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
exports.MarketDataController = void 0;
const common_1 = require("@nestjs/common");
const market_data_service_1 = require("./market-data.service");
const price_feed_dto_1 = require("./dto/price-feed.dto");
let MarketDataController = class MarketDataController {
    constructor(marketDataService) {
        this.marketDataService = marketDataService;
    }
    findAll() {
        return this.marketDataService.findAll();
    }
    findBySymbol(symbol) {
        return this.marketDataService.findBySymbol(symbol);
    }
    findByMarketType(marketType) {
        return this.marketDataService.findByMarketType(marketType);
    }
    updatePrice(dto) {
        return this.marketDataService.updatePrice(dto);
    }
};
exports.MarketDataController = MarketDataController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MarketDataController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('symbol/:symbol'),
    __param(0, (0, common_1.Param)('symbol')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MarketDataController.prototype, "findBySymbol", null);
__decorate([
    (0, common_1.Get)('market/:marketType'),
    __param(0, (0, common_1.Param)('marketType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MarketDataController.prototype, "findByMarketType", null);
__decorate([
    (0, common_1.Patch)('price'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [price_feed_dto_1.PriceFeedDto]),
    __metadata("design:returntype", void 0)
], MarketDataController.prototype, "updatePrice", null);
exports.MarketDataController = MarketDataController = __decorate([
    (0, common_1.Controller)('market-data'),
    __metadata("design:paramtypes", [market_data_service_1.MarketDataService])
], MarketDataController);
//# sourceMappingURL=market-data.controller.js.map