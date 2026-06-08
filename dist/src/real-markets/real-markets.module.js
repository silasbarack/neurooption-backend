"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealMarketsModule = void 0;
const common_1 = require("@nestjs/common");
const real_markets_controller_1 = require("./real-markets.controller");
const real_markets_service_1 = require("./real-markets.service");
let RealMarketsModule = class RealMarketsModule {
};
exports.RealMarketsModule = RealMarketsModule;
exports.RealMarketsModule = RealMarketsModule = __decorate([
    (0, common_1.Module)({
        controllers: [real_markets_controller_1.RealMarketsController],
        providers: [real_markets_service_1.RealMarketsService],
        exports: [real_markets_service_1.RealMarketsService],
    })
], RealMarketsModule);
//# sourceMappingURL=real-markets.module.js.map