import { Module } from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { CartService } from './cart.service';

@Module({
  providers: [CartRepository, CartService],
  exports: [CartService],
})
export class CartModule {}
