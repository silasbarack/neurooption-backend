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
exports.SocialTradingController = void 0;
const common_1 = require("@nestjs/common");
const create_copy_trade_dto_1 = require("./dto/create-copy-trade.dto");
const create_social_follow_dto_1 = require("./dto/create-social-follow.dto");
const update_copy_trade_dto_1 = require("./dto/update-copy-trade.dto");
const update_social_follow_dto_1 = require("./dto/update-social-follow.dto");
const social_trading_service_1 = require("./social-trading.service");
let SocialTradingController = class SocialTradingController {
    constructor(service) {
        this.service = service;
    }
    followTrader(dto) {
        return this.service.followTrader(dto);
    }
    findAllFollows() {
        return this.service.findAllFollows();
    }
    findFollowersOfTrader(traderUserId) {
        return this.service.findFollowersOfTrader(traderUserId);
    }
    findTradersFollowedByUser(followerUserId) {
        return this.service.findTradersFollowedByUser(followerUserId);
    }
    findFollow(id) {
        return this.service.findFollow(id);
    }
    updateFollow(id, dto) {
        return this.service.updateFollow(id, dto);
    }
    pauseFollow(id) {
        return this.service.pauseFollow(id);
    }
    resumeFollow(id) {
        return this.service.resumeFollow(id);
    }
    stopFollow(id) {
        return this.service.stopFollow(id);
    }
    createCopyTrade(dto) {
        return this.service.createCopyTrade(dto);
    }
    findCopyTrades() {
        return this.service.findCopyTrades();
    }
    findCopyTradesByFollower(followerUserId) {
        return this.service.findCopyTradesByFollower(followerUserId);
    }
    findCopyTradesByMaster(masterUserId) {
        return this.service.findCopyTradesByMaster(masterUserId);
    }
    updateCopyTrade(id, dto) {
        return this.service.updateCopyTrade(id, dto);
    }
};
exports.SocialTradingController = SocialTradingController;
__decorate([
    (0, common_1.Post)('follow'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_social_follow_dto_1.CreateSocialFollowDto]),
    __metadata("design:returntype", void 0)
], SocialTradingController.prototype, "followTrader", null);
__decorate([
    (0, common_1.Get)('follows'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SocialTradingController.prototype, "findAllFollows", null);
__decorate([
    (0, common_1.Get)('followers/:traderUserId'),
    __param(0, (0, common_1.Param)('traderUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SocialTradingController.prototype, "findFollowersOfTrader", null);
__decorate([
    (0, common_1.Get)('following/:followerUserId'),
    __param(0, (0, common_1.Param)('followerUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SocialTradingController.prototype, "findTradersFollowedByUser", null);
__decorate([
    (0, common_1.Get)('follows/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SocialTradingController.prototype, "findFollow", null);
__decorate([
    (0, common_1.Patch)('follows/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_social_follow_dto_1.UpdateSocialFollowDto]),
    __metadata("design:returntype", void 0)
], SocialTradingController.prototype, "updateFollow", null);
__decorate([
    (0, common_1.Patch)('follows/:id/pause'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SocialTradingController.prototype, "pauseFollow", null);
__decorate([
    (0, common_1.Patch)('follows/:id/resume'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SocialTradingController.prototype, "resumeFollow", null);
__decorate([
    (0, common_1.Patch)('follows/:id/stop'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SocialTradingController.prototype, "stopFollow", null);
__decorate([
    (0, common_1.Post)('copy-trades'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_copy_trade_dto_1.CreateCopyTradeDto]),
    __metadata("design:returntype", void 0)
], SocialTradingController.prototype, "createCopyTrade", null);
__decorate([
    (0, common_1.Get)('copy-trades'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SocialTradingController.prototype, "findCopyTrades", null);
__decorate([
    (0, common_1.Get)('copy-trades/follower/:followerUserId'),
    __param(0, (0, common_1.Param)('followerUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SocialTradingController.prototype, "findCopyTradesByFollower", null);
__decorate([
    (0, common_1.Get)('copy-trades/master/:masterUserId'),
    __param(0, (0, common_1.Param)('masterUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SocialTradingController.prototype, "findCopyTradesByMaster", null);
__decorate([
    (0, common_1.Patch)('copy-trades/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_copy_trade_dto_1.UpdateCopyTradeDto]),
    __metadata("design:returntype", void 0)
], SocialTradingController.prototype, "updateCopyTrade", null);
exports.SocialTradingController = SocialTradingController = __decorate([
    (0, common_1.Controller)('social-trading'),
    __metadata("design:paramtypes", [social_trading_service_1.SocialTradingService])
], SocialTradingController);
//# sourceMappingURL=social-trading.controller.js.map