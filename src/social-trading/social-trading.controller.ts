import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { CreateCopyTradeDto } from './dto/create-copy-trade.dto';
import { CreateSocialFollowDto } from './dto/create-social-follow.dto';
import { UpdateCopyTradeDto } from './dto/update-copy-trade.dto';
import { UpdateSocialFollowDto } from './dto/update-social-follow.dto';
import { SocialTradingService } from './social-trading.service';

@Controller('social-trading')
export class SocialTradingController {
  constructor(private readonly service: SocialTradingService) {}

  @Post('follow')
  followTrader(@Body() dto: CreateSocialFollowDto) {
    return this.service.followTrader(dto);
  }

  @Get('follows')
  findAllFollows() {
    return this.service.findAllFollows();
  }

  @Get('followers/:traderUserId')
  findFollowersOfTrader(@Param('traderUserId') traderUserId: string) {
    return this.service.findFollowersOfTrader(traderUserId);
  }

  @Get('following/:followerUserId')
  findTradersFollowedByUser(@Param('followerUserId') followerUserId: string) {
    return this.service.findTradersFollowedByUser(followerUserId);
  }

  @Get('follows/:id')
  findFollow(@Param('id') id: string) {
    return this.service.findFollow(id);
  }

  @Patch('follows/:id')
  updateFollow(
    @Param('id') id: string,
    @Body() dto: UpdateSocialFollowDto,
  ) {
    return this.service.updateFollow(id, dto);
  }

  @Patch('follows/:id/pause')
  pauseFollow(@Param('id') id: string) {
    return this.service.pauseFollow(id);
  }

  @Patch('follows/:id/resume')
  resumeFollow(@Param('id') id: string) {
    return this.service.resumeFollow(id);
  }

  @Patch('follows/:id/stop')
  stopFollow(@Param('id') id: string) {
    return this.service.stopFollow(id);
  }

  @Post('copy-trades')
  createCopyTrade(@Body() dto: CreateCopyTradeDto) {
    return this.service.createCopyTrade(dto);
  }

  @Get('copy-trades')
  findCopyTrades() {
    return this.service.findCopyTrades();
  }

  @Get('copy-trades/follower/:followerUserId')
  findCopyTradesByFollower(@Param('followerUserId') followerUserId: string) {
    return this.service.findCopyTradesByFollower(followerUserId);
  }

  @Get('copy-trades/master/:masterUserId')
  findCopyTradesByMaster(@Param('masterUserId') masterUserId: string) {
    return this.service.findCopyTradesByMaster(masterUserId);
  }

  @Patch('copy-trades/:id')
  updateCopyTrade(
    @Param('id') id: string,
    @Body() dto: UpdateCopyTradeDto,
  ) {
    return this.service.updateCopyTrade(id, dto);
  }
}