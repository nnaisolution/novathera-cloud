import { permissionProcedure, router } from '../../trpc/trpc';
import { ShippingTiersService } from './shipping-tiers.service';
import {
  createShippingTierInputSchema,
  listShippingTiersInputSchema,
  shippingTierIdInputSchema,
  updateShippingTierInputSchema,
} from './schemas/shipping-tier.schema';

export function createShippingTiersRouter(service: ShippingTiersService) {
  return router({
    list: permissionProcedure('shipping', 'read')
      .input(listShippingTiersInputSchema)
      .query(({ input }) => service.list(input)),

    getById: permissionProcedure('shipping', 'read')
      .input(shippingTierIdInputSchema)
      .query(({ input }) => service.getById(input.id)),

    create: permissionProcedure('shipping', 'create')
      .input(createShippingTierInputSchema)
      .mutation(({ input }) => service.create(input)),

    update: permissionProcedure('shipping', 'update')
      .input(updateShippingTierInputSchema)
      .mutation(({ input }) => service.update(input)),

    delete: permissionProcedure('shipping', 'delete')
      .input(shippingTierIdInputSchema)
      .mutation(({ input }) => service.delete(input.id)),
  });
}
