import { permissionProcedure, router } from '../../trpc/trpc';
import { DiscountsService } from './discounts.service';
import {
  createDiscountInputSchema,
  discountIdInputSchema,
  listDiscountsInputSchema,
} from './schemas/discount.schema';

export function createDiscountsRouter(service: DiscountsService) {
  return router({
    list: permissionProcedure('discount', 'read')
      .input(listDiscountsInputSchema)
      .query(({ input }) => service.list(input)),

    getById: permissionProcedure('discount', 'read')
      .input(discountIdInputSchema)
      .query(({ input }) => service.getById(input.id)),

    create: permissionProcedure('discount', 'create')
      .input(createDiscountInputSchema)
      .mutation(({ input }) => service.create(input)),

    deactivate: permissionProcedure('discount', 'update')
      .input(discountIdInputSchema)
      .mutation(({ input }) => service.deactivate(input.id)),
  });
}
