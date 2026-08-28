import { permissionProcedure, router } from '../../trpc/trpc';
import { AuditService } from './audit.service';
import { listAuditInputSchema } from './schemas/audit.schema';

export function createAuditRouter(service: AuditService) {
  return router({
    list: permissionProcedure('audit', 'read')
      .input(listAuditInputSchema)
      .query(({ input }) => service.list(input)),

    actors: permissionProcedure('audit', 'read').query(() => service.actors()),
  });
}
