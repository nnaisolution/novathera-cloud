import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { ResendMailConfigService } from './config.service';

@Module({
  imports: [ConfigModule.forFeature(configuration)],
  providers: [ResendMailConfigService],
  exports: [ResendMailConfigService],
})
export class ResendMailConfigModule {}
