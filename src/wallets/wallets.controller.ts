import { Controller, ForbiddenException, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WalletsService } from './wallets.service';

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get('user/:userId')
  getWallets(@Req() req: { user: { id: string; role: string } }, @Param('userId') userId: string) {
    if (req.user.id !== userId && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('You can only view your own wallets.');
    }
    return this.walletsService.getUserWallets(userId);
  }
}
