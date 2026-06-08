"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeframesModule = void 0;
const common_1 = require("@nestjs/common");
const timeframes_controller_1 = require("./timeframes.controller");
const timeframes_service_1 = require("./timeframes.service");
let TimeframesModule = class TimeframesModule {
};
exports.TimeframesModule = TimeframesModule;
exports.TimeframesModule = TimeframesModule = __decorate([
    (0, common_1.Module)({
        controllers: [timeframes_controller_1.TimeframesController],
        providers: [timeframes_service_1.TimeframesService],
        exports: [timeframes_service_1.TimeframesService],
    })
], TimeframesModule);
//# sourceMappingURL=timeframes.module.js.map