import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SocialService } from './social.service';

@ApiTags('Social')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get top traders leaderboard' })
  getLeaderboard(
    @Query('sortBy') sortBy: 'profit' | 'winRate' | 'trades' = 'profit',
    @Query('limit') limit = 50,
  ) {
    return this.socialService.getLeaderboard(sortBy, +limit);
  }

  @Get('following')
  @ApiOperation({ summary: 'Get traders you are copying' })
  getFollowing(@Request() req) {
    return this.socialService.getFollowing(req.user.id);
  }

  @Post('follow/:traderId')
  @ApiOperation({ summary: 'Start copying a trader' })
  follow(
    @Request() req,
    @Param('traderId') traderId: string,
    @Body() settings: { amount: number; maxTrades?: number },
  ) {
    return this.socialService.followTrader(req.user.id, traderId, settings);
  }

  @Delete('follow/:traderId')
  @ApiOperation({ summary: 'Stop copying a trader' })
  unfollow(@Request() req, @Param('traderId') traderId: string) {
    return this.socialService.unfollowTrader(req.user.id, traderId);
  }

  @Get('trader/:traderId')
  @ApiOperation({ summary: 'Get public trader profile' })
  getTraderProfile(@Param('traderId') traderId: string) {
    return this.socialService.getPublicTraderProfile(traderId);
  }

  @Post('become-public')
  @ApiOperation({ summary: 'Enable public trading profile' })
  becomePublic(@Request() req, @Body() body: { bio: string }) {
    return this.socialService.becomePublicTrader(req.user.id, body.bio);
  }

  @Post('stop-public')
  @ApiOperation({ summary: 'Disable public trading profile' })
  stopPublic(@Request() req) {
    return this.socialService.stopPublicTrading(req.user.id);
  }
}
