import { permissionProcedure, publicProcedure, router } from '../../trpc/trpc';
import { ServicesService } from './services.service';
import {
  createServiceInputSchema,
  listServicesInputSchema,
  publicGetServiceBySlugInputSchema,
  publicListServicesInputSchema,
  serviceIdInputSchema,
  updateServiceInputSchema,
} from './schemas/service.schema';

export function createServicesRouter(service: ServicesService) {
  return router({
    publicList: publicProcedure
      .input(publicListServicesInputSchema)
      .query(({ input }) => service.publicList(input)),

    publicGetBySlug: publicProcedure
      .input(publicGetServiceBySlugInputSchema)
      .query(({ input }) => service.publicGetBySlug(input.slug)),

    publicFacets: publicProcedure.query(() => service.publicFacets()),

    list: permissionProcedure('service', 'read')
      .input(listServicesInputSchema)
      .query(({ input }) => service.list(input)),

    getById: permissionProcedure('service', 'read')
      .input(serviceIdInputSchema)
      .query(({ input }) => service.getById(input.id)),

    create: permissionProcedure('service', 'create')
      .input(createServiceInputSchema)
      .mutation(({ input }) => service.create(input)),

    update: permissionProcedure('service', 'update')
      .input(updateServiceInputSchema)
      .mutation(({ input }) => service.update(input)),

    delete: permissionProcedure('service', 'delete')
      .input(serviceIdInputSchema)
      .mutation(({ input }) => service.delete(input.id)),
  });
}
