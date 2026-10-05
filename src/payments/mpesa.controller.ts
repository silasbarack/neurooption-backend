import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Logger,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from './authenticated-request';
import { StkPushDto } from './dto/stk-push.dto';
import { MpesaService, StkCallbackBody } from './mpesa.service';

// Routes avoid the word "mpesa": Safaricom rejects callback URLs containing it.
@Controller('payments/stk')
export class MpesaController {
  private readonly logger = new Logger(MpesaController.name);

  constructor(private readonly mpesa: MpesaService) {}

  /** Public summary so the app can show whether M-Pesa is available. */
  @Get('config')
  config() {
    const { configured, environment, minAmount, maxAmount } = this.mpesa.configSummary();
    return { configured, environment, minAmount, maxAmount };
  }

  @Post('deposits')
  @UseGuards(JwtAuthGuard)
  startDeposit(@Req() req: AuthenticatedRequest, @Body() dto: StkPushDto) {
    return this.mpesa.startDeposit(req.user.id, dto.phone, dto.amount);
  }

  @Get('deposits/:id')
  @UseGuards(JwtAuthGuard)
  depositStatus(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.mpesa.getDepositStatus(req.user.id, id);
  }

  /** Safaricom calls this; always acknowledge so Daraja doesn't retry. */
  @Post('callback/:token')
  @HttpCode(200)
  async callback(@Param('token') token: string, @Body() body: StkCallbackBody) {
    const expected = Buffer.from(this.mpesa.callbackToken);
    const given = Buffer.from(String(token || ''));
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
      throw new ForbiddenException();
    }

    try {
      await this.mpesa.handleCallback(body);
    } catch (error) {
      this.logger.error(
        `STK callback handling failed: ${error instanceof Error ? error.message : error}`,
      );
    }

    return { ResultCode: 0, ResultDesc: 'Accepted' };
  }
}
