import { protectedProcedure, router } from '../../trpc/trpc';
import { CartService } from './cart.service';
import {
  addCartItemInputSchema,
  removeCartItemInputSchema,
  updateCartQuantityInputSchema,
} from './schemas/cart.schema';

export function createCartRouter(service: CartService) {
  return router({
    get: protectedProcedure.query(({ ctx }) => service.get(ctx.user.id)),

    addItem: protectedProcedure
      .input(addCartItemInputSchema)
      .mutation(({ input, ctx }) => service.addItem(ctx.user.id, input)),

    updateQuantity: protectedProcedure
      .input(updateCartQuantityInputSchema)
      .mutation(({ input, ctx }) => service.updateQuantity(ctx.user.id, input)),

    removeItem: protectedProcedure
      .input(removeCartItemInputSchema)
      .mutation(({ input, ctx }) => service.removeItem(ctx.user.id, input)),

    clear: protectedProcedure.mutation(({ ctx }) => service.clear(ctx.user.id)),
  });
}
