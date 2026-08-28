import { Module } from '@nestjs/common';
import { DiscountsRepository } from './discounts.repository';
import { DiscountsService } from './discounts.service';

@Module({
  providers: [DiscountsRepository, DiscountsService],
  exports: [DiscountsService],
})
export class DiscountsModule {}
