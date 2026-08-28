import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../providers/database/postgres/prisma.service';

@Injectable()
export class CheckoutRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        stripeCustomerId: true,
      },
    });
  }

  async findCartWithItems(userId: string) {
    return this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { inventory: true, brand: true },
            },
          },
        },
      },
    });
  }

  async findActiveShippingTiers() {
    return this.prisma.shippingTier.findMany({
      where: { active: true },
      orderBy: { rateCents: 'asc' },
    });
  }

  async updateProductStripeIds(
    id: string,
    stripeProductId: string,
    stripePriceId: string,
  ) {
    return this.prisma.product.update({
      where: { id },
      data: { stripeProductId, stripePriceId },
    });
  }
}
