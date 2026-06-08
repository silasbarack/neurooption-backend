"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpiriesModule = void 0;
const common_1 = require("@nestjs/common");
const expiries_controller_1 = require("./expiries.controller");
const expiries_service_1 = require("./expiries.service");
let ExpiriesModule = class ExpiriesModule {
};
exports.ExpiriesModule = ExpiriesModule;
exports.ExpiriesModule = ExpiriesModule = __decorate([
    (0, common_1.Module)({
        controllers: [expiries_controller_1.ExpiriesController],
        providers: [expiries_service_1.ExpiriesService],
        exports: [expiries_service_1.ExpiriesService],
    })
], ExpiriesModule);
//# sourceMappingURL=expiries.module.js.map