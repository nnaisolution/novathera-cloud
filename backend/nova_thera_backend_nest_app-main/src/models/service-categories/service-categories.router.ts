import { permissionProcedure, publicProcedure, router } from '../../trpc/trpc';
import { ServiceCategoriesService } from './service-categories.service';
import {
  createServiceCategoryInputSchema,
  reorderServiceCategoriesInputSchema,
  serviceCategoryIdInputSchema,
  updateServiceCategoryInputSchema,
} from './schemas/service-category.schema';

export function createServiceCategoriesRouter(
  service: ServiceCategoriesService,
) {
  return router({
    publicList: publicProcedure.query(() => service.publicList()),

    list: permissionProcedure('service', 'read').query(() => service.list()),

    getById: permissionProcedure('service', 'read')
      .input(serviceCategoryIdInputSchema)
      .query(({ input }) => service.getById(input.id)),

    create: permissionProcedure('service', 'create')
      .input(createServiceCategoryInputSchema)
      .mutation(({ input }) => service.create(input)),

    update: permissionProcedure('service', 'update')
      .input(updateServiceCategoryInputSchema)
      .mutation(({ input }) => service.update(input)),

    delete: permissionProcedure('service', 'delete')
      .input(serviceCategoryIdInputSchema)
      .mutation(({ input }) => service.delete(input.id)),

    reorder: permissionProcedure('service', 'update')
      .input(reorderServiceCategoriesInputSchema)
      .mutation(({ input }) => service.reorder(input.orderedIds)),
  });
}
