import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../../providers/database/postgres/prisma.service';
import type {
  CreateShippingTierInput,
  ListShippingTiersInput,
  UpdateShippingTierInput,
} from './schemas/shipping-tier.schema';

@Injectable()
export class ShippingTiersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(input: ListShippingTiersInput) {
    const where: Prisma.ShippingTierWhereInput = {
      ...(input.active !== undefined ? { active: input.active } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.shippingTier.findMany({
        where,
        orderBy: { [input.sortBy]: input.sortOrder },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      this.prisma.shippingTier.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return this.prisma.shippingTier.findUnique({ where: { id } });
  }

  async create(data: CreateShippingTierInput) {
    return this.prisma.shippingTier.create({
      data: {
        name: data.name,
        rateCents: data.rateCents,
        freeOverCents: data.freeOverCents ?? null,
        minDeliveryDays: data.minDeliveryDays ?? null,
        maxDeliveryDays: data.maxDeliveryDays ?? null,
        active: data.active,
      },
    });
  }

  async update(id: string, data: Omit<UpdateShippingTierInput, 'id'>) {
    return this.prisma.shippingTier.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.shippingTier.delete({ where: { id } });
  }
}
