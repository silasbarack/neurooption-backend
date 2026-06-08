import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import { DepositDto } from './dto/deposit.dto';
import { RejectWithdrawalDto } from './dto/reject-withdrawal.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { WalletsService } from './wallets.service';

@Controller('wallets')
export class WalletsController {
  constructor(
    private readonly walletsService: WalletsService,
  ) {}

  @Get('user/:userId')
  getWallets(
    @Param('userId') userId: string,
  ) {
    return this.walletsService.getUserWallets(
      userId,
    );
  }

  @Post('deposit')
  deposit(
    @Body() dto: DepositDto,
  ) {
    return this.walletsService.deposit(dto);
  }

  @Post('withdraw')
  withdraw(
    @Body() dto: WithdrawDto,
  ) {
    return this.walletsService.withdraw(dto);
  }

  @Post('withdrawals/:transactionId/processing')
  markWithdrawalProcessing(
    @Param('transactionId') transactionId: string,
  ) {
    return this.walletsService.markWithdrawalProcessing(
      transactionId,
    );
  }

  @Post('withdrawals/:transactionId/complete')
  completeWithdrawal(
    @Param('transactionId') transactionId: string,
  ) {
    return this.walletsService.completeWithdrawal(
      transactionId,
    );
  }

  @Post('withdrawals/:transactionId/reject')
  rejectWithdrawal(
    @Param('transactionId') transactionId: string,
    @Body() dto: RejectWithdrawalDto,
  ) {
    return this.walletsService.rejectWithdrawal(
      transactionId,
      dto,
    );
  }
}