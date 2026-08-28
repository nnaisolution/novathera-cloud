import { permissionProcedure, router } from '../../trpc/trpc';
import { PackagesService } from './packages.service';
import {
  createPackageInputSchema,
  listPackagesInputSchema,
  packageIdInputSchema,
  updatePackageInputSchema,
} from './schemas/package.schema';

export function createPackagesRouter(service: PackagesService) {
  return router({
    list: permissionProcedure('service', 'read')
      .input(listPackagesInputSchema)
      .query(({ input }) => service.list(input)),

    getById: permissionProcedure('service', 'read')
      .input(packageIdInputSchema)
      .query(({ input }) => service.getById(input.id)),

    create: permissionProcedure('service', 'create')
      .input(createPackageInputSchema)
      .mutation(({ input }) => service.create(input)),

    update: permissionProcedure('service', 'update')
      .input(updatePackageInputSchema)
      .mutation(({ input }) => service.update(input)),

    delete: permissionProcedure('service', 'delete')
      .input(packageIdInputSchema)
      .mutation(({ input }) => service.delete(input.id)),
  });
}
