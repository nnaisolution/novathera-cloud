import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../../providers/database/postgres/prisma.service';
import type {
  CreateDiscountInput,
  ListDiscountsInput,
} from './schemas/discount.schema';

@Injectable()
export class DiscountsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(input: ListDiscountsInput) {
    const where: Prisma.DiscountWhereInput = {
      ...(input.active !== undefined ? { active: input.active } : {}),
      ...(input.search
        ? { code: { contains: input.search, mode: 'insensitive' } }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.discount.findMany({
        where,
        orderBy: { [input.sortBy]: input.sortOrder },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      this.prisma.discount.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return this.prisma.discount.findUnique({ where: { id } });
  }

  async create(
    data: CreateDiscountInput & {
      stripeCouponId?: string | null;
      stripePromotionCodeId?: string | null;
    },
  ) {
    return this.prisma.discount.create({
      data: {
        code: data.code,
        type: data.type,
        percentOff: data.percentOff ?? null,
        amountOffCents: data.amountOffCents ?? null,
        expiresAt: data.expiresAt ?? null,
        stripeCouponId: data.stripeCouponId ?? null,
        stripePromotionCodeId: data.stripePromotionCodeId ?? null,
      },
    });
  }

  async deactivate(id: string) {
    return this.prisma.discount.update({
      where: { id },
      data: { active: false },
    });
  }
}
