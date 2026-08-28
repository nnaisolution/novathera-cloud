import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../providers/database/postgres/prisma.service';

const cartInclude = {
  items: {
    include: {
      product: {
        include: {
          images: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
          inventory: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' as const },
  },
};

@Injectable()
export class CartRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateByUserId(userId: string) {
    const existing = await this.prisma.cart.findUnique({
      where: { userId },
      include: cartInclude,
    });
    if (existing) return existing;

    return this.prisma.cart.create({
      data: { userId },
      include: cartInclude,
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.cart.findUnique({
      where: { userId },
      include: cartInclude,
    });
  }

  async findActiveProduct(productId: string) {
    return this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null, status: 'ACTIVE' },
      include: { inventory: true },
    });
  }

  async upsertItem(cartId: string, productId: string, quantity: number) {
    if (quantity <= 0) {
      await this.prisma.cartItem.deleteMany({
        where: { cartId, productId },
      });
      return;
    }

    await this.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId, productId } },
      create: { cartId, productId, quantity },
      update: { quantity },
    });
  }

  async removeItem(cartId: string, productId: string) {
    await this.prisma.cartItem.deleteMany({
      where: { cartId, productId },
    });
  }

  async clearItems(cartId: string) {
    await this.prisma.cartItem.deleteMany({ where: { cartId } });
  }
}
