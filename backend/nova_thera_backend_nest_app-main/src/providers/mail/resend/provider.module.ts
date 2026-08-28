import { Global, Module } from '@nestjs/common';
import { AuthConfigModule } from '../../../config/auth/config.module';
import { ResendMailConfigModule } from '../../../config/mail/resend/config.module';
import { MailService } from './mail.service';

@Global()
@Module({
  imports: [ResendMailConfigModule, AuthConfigModule],
  providers: [MailService],
  exports: [MailService],
})
export class ResendMailProviderModule {}
