import { permissionProcedure, publicProcedure, router } from '../../trpc/trpc';
import { LocationsService } from './locations.service';
import {
  createLocationInputSchema,
  listLocationsInputSchema,
  locationIdInputSchema,
  publicListLocationsInputSchema,
  updateLocationInputSchema,
} from './schemas/location.schema';

export function createLocationsRouter(service: LocationsService) {
  return router({
    publicList: publicProcedure
      .input(publicListLocationsInputSchema)
      .query(({ input }) => service.publicList(input)),

    publicCities: publicProcedure.query(() => service.publicCities()),

    list: permissionProcedure('location', 'read')
      .input(listLocationsInputSchema)
      .query(({ input }) => service.list(input)),

    getById: permissionProcedure('location', 'read')
      .input(locationIdInputSchema)
      .query(({ input }) => service.getById(input.id)),

    create: permissionProcedure('location', 'create')
      .input(createLocationInputSchema)
      .mutation(({ input }) => service.create(input)),

    update: permissionProcedure('location', 'update')
      .input(updateLocationInputSchema)
      .mutation(({ input }) => service.update(input)),

    delete: permissionProcedure('location', 'delete')
      .input(locationIdInputSchema)
      .mutation(({ input }) => service.delete(input.id)),
  });
}
