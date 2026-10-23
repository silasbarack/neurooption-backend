import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LeaderboardService } from './leaderboard.service';
@ApiTags('leaderboard') @Controller('leaderboard')
export class LeaderboardController {
  constructor(private lb: LeaderboardService) {}
  @Get('pnl') pnl() { return this.lb.getTopByPnl(); }
  @Get('winrate') wr() { return this.lb.getTopByWinRate(); }
  @Get('me') @UseGuards(JwtAuthGuard) @ApiBearerAuth() me(@Request() req) { return this.lb.getUserRank(req.user.id); }
}
