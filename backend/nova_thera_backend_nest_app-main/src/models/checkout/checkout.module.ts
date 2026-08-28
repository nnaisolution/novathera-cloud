import { Module } from '@nestjs/common';
import { StripeConfigModule } from '../../config/stripe/config.module';
import { CheckoutRepository } from './checkout.repository';
import { CheckoutService } from './checkout.service';

@Module({
  imports: [StripeConfigModule],
  providers: [CheckoutRepository, CheckoutService],
  exports: [CheckoutService],
})
export class CheckoutModule {}
