import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../../providers/database/postgres/prisma.service';
import type { ListBrandsInput } from './schemas/brand.schema';

@Injectable()
export class BrandsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(input: ListBrandsInput) {
    const where: Prisma.BrandWhereInput = {
      deletedAt: null,
      ...(input.active !== undefined ? { active: input.active } : {}),
      ...(input.search
        ? { name: { contains: input.search, mode: 'insensitive' } }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.brand.findMany({
        where,
        orderBy: { [input.sortBy]: input.sortOrder },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      this.prisma.brand.count({ where }),
    ]);

    return { items, total };
  }

  async findAllPublic() {
    return this.prisma.brand.findMany({
      where: { deletedAt: null, active: true },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        tagline: true,
        logoUrl: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.brand.findFirst({ where: { id, deletedAt: null } });
  }

  async findPlatformBrand() {
    return this.prisma.brand.findFirst({
      where: { isPlatform: true, deletedAt: null },
    });
  }

  async slugExists(slug: string, excludeId?: string) {
    const existing = await this.prisma.brand.findFirst({
      where: {
        slug,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    return Boolean(existing);
  }

  async countProducts(brandId: string) {
    return this.prisma.product.count({ where: { brandId, deletedAt: null } });
  }

  async create(data: Prisma.BrandCreateInput) {
    return this.prisma.brand.create({ data });
  }

  async update(id: string, data: Prisma.BrandUpdateInput) {
    return this.prisma.brand.update({ where: { id }, data });
  }

  /**
   * Demotes any other platform brand in the same transaction as promoting this
   * one, so the "exactly one platform" rule can never be momentarily violated.
   */
  async setPlatformBrand(id: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.brand.updateMany({
        where: { isPlatform: true, NOT: { id } },
        data: { isPlatform: false },
      });
      return tx.brand.update({ where: { id }, data: { isPlatform: true } });
    });
  }

  async softDelete(id: string) {
    return this.prisma.brand.update({
      where: { id },
      data: { deletedAt: new Date(), active: false },
    });
  }
}
