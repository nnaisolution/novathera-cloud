import { Module } from '@nestjs/common';
import { AuthConfigModule } from '../config/auth/config.module';
import { MobileSessionController } from './mobile-session.controller';
import { MobileSessionService } from './mobile-session.service';

@Module({
  imports: [AuthConfigModule],
  controllers: [MobileSessionController],
  providers: [MobileSessionService],
})
export class MobileModule {}
