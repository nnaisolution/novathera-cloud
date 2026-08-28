import { Module } from '@nestjs/common';
import { ServicesRepository } from './services.repository';
import { ServicesService } from './services.service';

@Module({
  providers: [ServicesRepository, ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
