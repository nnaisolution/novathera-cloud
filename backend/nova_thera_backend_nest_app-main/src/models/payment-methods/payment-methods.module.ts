import { Module } from '@nestjs/common';
import { PaymentMethodsRepository } from './payment-methods.repository';
import { PaymentMethodsService } from './payment-methods.service';

@Module({
  providers: [PaymentMethodsRepository, PaymentMethodsService],
  exports: [PaymentMethodsService],
})
export class PaymentMethodsModule {}
