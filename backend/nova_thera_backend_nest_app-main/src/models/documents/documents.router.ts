import { permissionProcedure, protectedProcedure, router } from '../../trpc/trpc';
import { DocumentsService } from './documents.service';
import {
  createDocumentInputSchema,
  documentIdInputSchema,
  listDocumentsInputSchema,
  updateDocumentInputSchema,
} from './schemas/document.schema';

export function createDocumentsRouter(service: DocumentsService) {
  return router({
    myList: protectedProcedure.query(({ ctx }) =>
      service.listForCustomer(ctx.user.id),
    ),

    myGetById: protectedProcedure
      .input(documentIdInputSchema)
      .query(({ input, ctx }) =>
        service.getForCustomer(input.id, ctx.user.id),
      ),

    myDownloadUrl: protectedProcedure
      .input(documentIdInputSchema)
      .mutation(({ input, ctx }) =>
        service.getMyDownloadUrl(input.id, ctx.user.id),
      ),

    // A mutation rather than a query: the URL is short-lived and must not be
    // cached or refetched from a stale query cache after it has expired.
    downloadUrl: permissionProcedure('document', 'read')
      .input(documentIdInputSchema)
      .mutation(({ input }) => service.getDownloadUrl(input.id)),

    list: permissionProcedure('document', 'read')
      .input(listDocumentsInputSchema)
      .query(({ input }) => service.list(input)),

    create: permissionProcedure('document', 'create')
      .input(createDocumentInputSchema)
      .mutation(({ input }) => service.create(input)),

    update: permissionProcedure('document', 'update')
      .input(updateDocumentInputSchema)
      .mutation(({ input }) => service.update(input)),

    delete: permissionProcedure('document', 'delete')
      .input(documentIdInputSchema)
      .mutation(({ input }) => service.delete(input.id)),
  });
}
