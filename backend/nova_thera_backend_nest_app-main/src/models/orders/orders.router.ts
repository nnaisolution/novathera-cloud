import {
  permissionProcedure,
  protectedProcedure,
  router,
} from '../../trpc/trpc';
import { OrdersService } from './orders.service';
import {
  listMyOrdersInputSchema,
  listOrdersInputSchema,
  orderIdInputSchema,
  orderSessionIdInputSchema,
  setFulfillmentStatusInputSchema,
} from './schemas/order.schema';

export function createOrdersRouter(service: OrdersService) {
  return router({
    myList: protectedProcedure
      .input(listMyOrdersInputSchema)
      .query(({ input, ctx }) => service.myList(ctx.user.id, input)),

    myGetById: protectedProcedure
      .input(orderIdInputSchema)
      .query(({ input, ctx }) => service.myGetById(input.id, ctx.user.id)),

    myGetBySessionId: protectedProcedure
      .input(orderSessionIdInputSchema)
      .query(({ input, ctx }) =>
        service.myGetBySessionId(input.sessionId, ctx.user.id),
      ),

    list: permissionProcedure('order', 'read')
      .input(listOrdersInputSchema)
      .query(({ input }) => service.list(input)),

    getById: permissionProcedure('order', 'read')
      .input(orderIdInputSchema)
      .query(({ input }) => service.getById(input.id)),

    setFulfillmentStatus: permissionProcedure('order', 'setStatus')
      .input(setFulfillmentStatusInputSchema)
      .mutation(({ input }) => service.setFulfillmentStatus(input)),

    // Re-attempt an outstanding brand payout (failed transfer, or a brand that
    // finished Connect onboarding after the order was placed).
    retryBrandTransfers: permissionProcedure('order', 'update')
      .input(orderIdInputSchema)
      .mutation(({ input }) => service.retryBrandTransfers(input.id)),
  });
}
