import { Module } from '@nestjs/common';

import { EmailsModule } from '../emails/emails.module';
import { RecaptchaModule } from '../security/recaptcha.module';
import { WalletsModule } from '../wallets/wallets.module';
import { AccountDeletionService } from './account-deletion.service';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  imports: [WalletsModule, EmailsModule, RecaptchaModule],
  controllers: [AccountController],
  providers: [AccountService, AccountDeletionService],
})
export class AccountModule {}
