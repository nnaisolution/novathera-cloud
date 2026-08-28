import { permissionProcedure, publicProcedure, router } from '../../trpc/trpc';
import { BrandsService } from './brands.service';
import {
  brandIdInputSchema,
  createBrandInputSchema,
  listBrandsInputSchema,
  updateBrandInputSchema,
} from './schemas/brand.schema';

export function createBrandsRouter(service: BrandsService) {
  return router({
    // Storefront brand filter — no auth, active brands only.
    publicList: publicProcedure.query(() => service.publicList()),

    list: permissionProcedure('brand', 'read')
      .input(listBrandsInputSchema)
      .query(({ input }) => service.list(input)),

    getById: permissionProcedure('brand', 'read')
      .input(brandIdInputSchema)
      .query(({ input }) => service.getById(input.id)),

    create: permissionProcedure('brand', 'create')
      .input(createBrandInputSchema)
      .mutation(({ input }) => service.create(input)),

    update: permissionProcedure('brand', 'update')
      .input(updateBrandInputSchema)
      .mutation(({ input }) => service.update(input)),

    delete: permissionProcedure('brand', 'delete')
      .input(brandIdInputSchema)
      .mutation(({ input }) => service.delete(input.id)),

    setPlatform: permissionProcedure('brand', 'update')
      .input(brandIdInputSchema)
      .mutation(({ input }) => service.setPlatform(input.id)),

    // Stripe Connect — creating an account and moving money is admin-only.
    startConnectOnboarding: permissionProcedure('brand', 'update')
      .input(brandIdInputSchema)
      .mutation(({ input }) => service.startConnectOnboarding(input.id)),

    refreshConnectStatus: permissionProcedure('brand', 'update')
      .input(brandIdInputSchema)
      .mutation(({ input }) => service.refreshConnectStatus(input.id)),
  });
}
