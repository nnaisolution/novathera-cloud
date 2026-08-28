import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../../providers/database/postgres/prisma.service';
import type {
  ListMyOrdersInput,
  ListOrdersInput,
  SetFulfillmentStatusInput,
} from './schemas/order.schema';

const orderDetailInclude = {
  items: true,
  user: { select: { id: true, name: true, email: true } },
  brandSplits: {
    include: {
      brand: { select: { id: true, name: true, slug: true, isPlatform: true } },
    },
    orderBy: { grossCents: 'desc' as const },
  },
} satisfies Prisma.OrderInclude;

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyForCustomer(userId: string, input: ListMyOrdersInput) {
    const where: Prisma.OrderWhereInput = { userId };

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { [input.sortBy]: input.sortOrder },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, total };
  }

  async findByIdForCustomer(id: string, userId: string) {
    return this.prisma.order.findFirst({
      where: { id, userId },
      include: orderDetailInclude,
    });
  }

  async findBySessionIdForCustomer(sessionId: string, userId: string) {
    return this.prisma.order.findFirst({
      where: { stripeCheckoutSessionId: sessionId, userId },
      include: orderDetailInclude,
    });
  }

  async findMany(input: ListOrdersInput) {
    const where: Prisma.OrderWhereInput = {
      ...(input.status ? { status: input.status } : {}),
      ...(input.search
        ? {
            OR: [
              { orderCode: { contains: input.search, mode: 'insensitive' } },
              {
                user: {
                  is: {
                    OR: [
                      {
                        name: { contains: input.search, mode: 'insensitive' },
                      },
                      {
                        email: { contains: input.search, mode: 'insensitive' },
                      },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: orderDetailInclude,
        orderBy: { [input.sortBy]: input.sortOrder },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: orderDetailInclude,
    });
  }

  async setFulfillmentStatus(input: SetFulfillmentStatusInput) {
    const now = new Date();
    return this.prisma.order.update({
      where: { id: input.id },
      data: {
        status: input.status,
        ...(input.status === 'FULFILLED'
          ? { fulfilledAt: now }
          : {
              shippedAt: now,
              trackingNumber: input.trackingNumber,
            }),
      },
      include: orderDetailInclude,
    });
  }
}
