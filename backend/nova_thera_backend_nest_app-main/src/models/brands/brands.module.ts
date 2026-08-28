import { Module } from '@nestjs/common';
import { BrandsRepository } from './brands.repository';
import { BrandsService } from './brands.service';

@Module({
  providers: [BrandsRepository, BrandsService],
  exports: [BrandsService],
})
export class BrandsModule {}
