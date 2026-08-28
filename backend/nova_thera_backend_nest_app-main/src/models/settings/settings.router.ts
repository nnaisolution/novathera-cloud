import { auditActor, changedKeys } from '../../common/helpers/audit-actor';
import { permissionProcedure, router } from '../../trpc/trpc';
import { AuditService } from '../audit/audit.service';
import { SettingsService } from './settings.service';
import { updateSettingsInputSchema } from './schemas/settings.schema';

export function createSettingsRouter(
  service: SettingsService,
  audit: AuditService,
) {
  return router({
    get: permissionProcedure('setting', 'read').query(() => service.getAll()),

    update: permissionProcedure('setting', 'update')
      .input(updateSettingsInputSchema)
      .mutation(async ({ input, ctx }) => {
        const before = await service.getAll();
        const changed = changedKeys(
          before[input.group] as Record<string, unknown>,
          input.values as Record<string, unknown>,
        );

        const updated = await service.update(input, ctx.user.id);

        // Nothing actually moved — don't clutter the trail.
        if (changed.length > 0) {
          await audit.record({
            ...auditActor(ctx),
            action: 'settings.updated',
            targetType: 'settings',
            targetId: input.group,
            targetLabel: input.group,
            summary: `Updated ${input.group} settings (${changed.join(', ')})`,
            metadata: { group: input.group, changed },
          });
        }

        return updated;
      }),
  });
}
