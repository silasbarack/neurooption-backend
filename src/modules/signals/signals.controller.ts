import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SignalsService } from './signals.service';

@ApiTags('signals')
@Controller('signals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SignalsController {
  constructor(private signalsService: SignalsService) {}
  @Get() getAll() { return this.signalsService.getActiveSignals(); }
  @Get(':assetId') getForAsset(@Param('assetId') id: string) { return this.signalsService.getSignalForAsset(id); }
}
