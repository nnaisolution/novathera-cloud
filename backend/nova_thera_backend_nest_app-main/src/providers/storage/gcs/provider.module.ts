import { Global, Module } from '@nestjs/common';
import { StorageConfigModule } from '../../../config/storage/config.module';
import { GcsStorageService } from './storage.service';

@Global()
@Module({
  imports: [StorageConfigModule],
  providers: [GcsStorageService],
  exports: [GcsStorageService],
})
export class GcsStorageProviderModule {}
