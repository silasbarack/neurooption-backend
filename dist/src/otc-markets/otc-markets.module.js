"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtcMarketsModule = void 0;
const common_1 = require("@nestjs/common");
const otc_markets_controller_1 = require("./otc-markets.controller");
const otc_markets_service_1 = require("./otc-markets.service");
let OtcMarketsModule = class OtcMarketsModule {
};
exports.OtcMarketsModule = OtcMarketsModule;
exports.OtcMarketsModule = OtcMarketsModule = __decorate([
    (0, common_1.Module)({
        controllers: [otc_markets_controller_1.OtcMarketsController],
        providers: [otc_markets_service_1.OtcMarketsService],
        exports: [otc_markets_service_1.OtcMarketsService],
    })
], OtcMarketsModule);
//# sourceMappingURL=otc-markets.module.js.map