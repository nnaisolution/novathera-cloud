import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { StripeConfigService } from './config.service';

@Global()
@Module({
  imports: [ConfigModule.forFeature(configuration)],
  providers: [StripeConfigService],
  exports: [StripeConfigService],
})
export class StripeConfigModule {}
