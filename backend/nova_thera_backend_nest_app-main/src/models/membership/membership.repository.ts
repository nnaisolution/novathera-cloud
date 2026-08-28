import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../providers/database/postgres/prisma.service';

const ACTIVE_STATUSES = ['active', 'trialing', 'past_due'];

@Injectable()
export class MembershipRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findCurrentForUser(userId: string) {
    return this.prisma.subscription.findFirst({
      where: { referenceId: userId, status: { in: ACTIVE_STATUSES } },
      orderBy: { periodEnd: 'desc' },
    });
  }

  async findBookingsThisYear(userId: string) {
    const year = new Date().getFullYear();
    return this.prisma.booking.findMany({
      where: {
        customerUserId: userId,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        startTime: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) },
      },
      select: {
        priceCents: true,
        service: { select: { standardPriceCents: true } },
      },
    });
  }

  async sumPaidOrderTotalCentsThisYear(userId: string) {
    const year = new Date().getFullYear();
    const result = await this.prisma.order.aggregate({
      where: {
        userId,
        status: { in: ['PAID', 'FULFILLED', 'SHIPPED'] },
        createdAt: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) },
      },
      _sum: { totalCents: true },
    });
    return result._sum.totalCents ?? 0;
  }
}
