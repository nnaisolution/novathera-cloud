import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { StorageConfigService } from './config.service';

@Global()
@Module({
  imports: [ConfigModule.forFeature(configuration)],
  providers: [StorageConfigService],
  exports: [StorageConfigService],
})
export class StorageConfigModule {}
