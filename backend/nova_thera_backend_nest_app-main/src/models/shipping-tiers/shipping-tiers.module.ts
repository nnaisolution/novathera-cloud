import { Module } from '@nestjs/common';
import { ShippingTiersRepository } from './shipping-tiers.repository';
import { ShippingTiersService } from './shipping-tiers.service';

@Module({
  providers: [ShippingTiersRepository, ShippingTiersService],
  exports: [ShippingTiersService],
})
export class ShippingTiersModule {}
