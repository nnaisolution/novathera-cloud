import { protectedProcedure, router } from '../../trpc/trpc';
import { PaymentMethodsService } from './payment-methods.service';
import { paymentMethodIdInputSchema } from './schemas/payment-method.schema';

export function createPaymentMethodsRouter(service: PaymentMethodsService) {
  return router({
    myList: protectedProcedure.query(({ ctx }) =>
      service.listForCustomer(ctx.user.id),
    ),

    myCreateSetupIntent: protectedProcedure.mutation(({ ctx }) =>
      service.createSetupIntent(ctx.user.id),
    ),

    myDetach: protectedProcedure
      .input(paymentMethodIdInputSchema)
      .mutation(({ input, ctx }) =>
        service.detach(ctx.user.id, input.paymentMethodId),
      ),

    mySetDefault: protectedProcedure
      .input(paymentMethodIdInputSchema)
      .mutation(({ input, ctx }) =>
        service.setDefault(ctx.user.id, input.paymentMethodId),
      ),
  });
}
