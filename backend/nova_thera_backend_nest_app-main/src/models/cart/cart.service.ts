import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { handlePrismaError } from '../../common/helpers/prisma-errors';
import { CartRepository } from './cart.repository';
import type {
  AddCartItemInput,
  RemoveCartItemInput,
  UpdateCartQuantityInput,
} from './schemas/cart.schema';

@Injectable()
export class CartService {
  constructor(private readonly repository: CartRepository) {}

  private assertStock(
    inventory: { quantity: number; allowBackorder: boolean } | null,
    quantity: number,
  ) {
    if (!inventory) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Product is out of stock',
      });
    }
    if (inventory.allowBackorder) return;
    if (inventory.quantity < quantity) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Only ${inventory.quantity} in stock`,
      });
    }
  }

  async get(userId: string) {
    return this.repository.findOrCreateByUserId(userId);
  }

  async addItem(userId: string, input: AddCartItemInput) {
    try {
      const product = await this.repository.findActiveProduct(input.productId);
      if (!product) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Product is not available',
        });
      }

      const cart = await this.repository.findOrCreateByUserId(userId);
      const existing = cart.items.find(
        (item) => item.productId === input.productId,
      );
      const nextQuantity = (existing?.quantity ?? 0) + input.quantity;
      this.assertStock(product.inventory, nextQuantity);

      await this.repository.upsertItem(cart.id, input.productId, nextQuantity);
      return this.repository.findOrCreateByUserId(userId);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      handlePrismaError(error);
    }
  }

  async updateQuantity(userId: string, input: UpdateCartQuantityInput) {
    try {
      const cart = await this.repository.findOrCreateByUserId(userId);
      if (input.quantity === 0) {
        await this.repository.removeItem(cart.id, input.productId);
        return this.repository.findOrCreateByUserId(userId);
      }

      const product = await this.repository.findActiveProduct(input.productId);
      if (!product) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Product is not available',
        });
      }
      this.assertStock(product.inventory, input.quantity);

      await this.repository.upsertItem(
        cart.id,
        input.productId,
        input.quantity,
      );
      return this.repository.findOrCreateByUserId(userId);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      handlePrismaError(error);
    }
  }

  async removeItem(userId: string, input: RemoveCartItemInput) {
    try {
      const cart = await this.repository.findOrCreateByUserId(userId);
      await this.repository.removeItem(cart.id, input.productId);
      return this.repository.findOrCreateByUserId(userId);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      handlePrismaError(error);
    }
  }

  async clear(userId: string) {
    try {
      const cart = await this.repository.findOrCreateByUserId(userId);
      await this.repository.clearItems(cart.id);
      return this.repository.findOrCreateByUserId(userId);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      handlePrismaError(error);
    }
  }
}
