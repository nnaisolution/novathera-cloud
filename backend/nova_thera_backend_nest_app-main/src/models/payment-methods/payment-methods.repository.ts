import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../providers/database/postgres/prisma.service';

@Injectable()
export class PaymentMethodsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, stripeCustomerId: true },
    });
  }

  async setStripeCustomerId(userId: string, stripeCustomerId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId },
    });
  }
}
