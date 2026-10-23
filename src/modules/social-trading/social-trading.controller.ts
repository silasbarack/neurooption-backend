import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
@ApiTags('social-trading') @Controller('social') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
export class SocialTradingController {
  @Get('traders') traders() { return Array.from({length:10},(_,i)=>({id:`t${i}`,name:`Trader${i+1}`,winRate:(60+Math.random()*30).toFixed(1),totalPnl:(1000+Math.random()*50000).toFixed(2),followers:Math.floor(Math.random()*5000),isVerified:i<3})); }
  @Post('follow/:id') follow(@Param('id') id: string) { return { success: true, traderId: id }; }
}
