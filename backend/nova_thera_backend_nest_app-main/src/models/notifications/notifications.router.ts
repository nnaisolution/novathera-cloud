import { protectedProcedure, router } from '../../trpc/trpc';
import { NotificationsService } from './notifications.service';
import { registerDeviceInputSchema } from './schemas/notification.schema';

export function createNotificationsRouter(service: NotificationsService) {
  const registerDevice = protectedProcedure
    .input(registerDeviceInputSchema)
    .mutation(({ input, ctx }) => service.registerDevice(ctx.user.id, input));

  return router({
    registerDevice,
    myRegisterDevice: registerDevice,
  });
}
