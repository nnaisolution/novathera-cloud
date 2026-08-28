import {
  permissionProcedure,
  protectedProcedure,
  router,
} from '../../trpc/trpc';
import { StorageService } from './storage.service';
import {
  createDocumentUploadUrlInputSchema,
  createProductImageUploadUrlInputSchema,
} from './schemas/storage.schema';

export function createStorageRouter(service: StorageService) {
  return router({
    status: protectedProcedure.query(() => service.status()),

    // A signed upload URL is a real write capability, so it is gated on the
    // same permission as creating the record it will be attached to.
    createProductImageUploadUrl: permissionProcedure('product', 'update')
      .input(createProductImageUploadUrlInputSchema)
      .mutation(({ input }) => service.createProductImageUploadUrl(input)),

    createDocumentUploadUrl: permissionProcedure('document', 'create')
      .input(createDocumentUploadUrlInputSchema)
      .mutation(({ input }) => service.createDocumentUploadUrl(input)),
  });
}
