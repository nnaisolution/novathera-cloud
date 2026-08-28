import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../../providers/database/postgres/prisma.service';
import type {
  CreatePackageInput,
  ListPackagesInput,
  UpdatePackageInput,
} from './schemas/package.schema';

@Injectable()
export class PackagesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(input: ListPackagesInput) {
    const where: Prisma.PackageWhereInput = {
      deletedAt: null,
      ...(input.status ? { status: input.status } : {}),
      ...(input.serviceId ? { serviceId: input.serviceId } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.package.findMany({
        where,
        include: { service: { select: { id: true, name: true } } },
        orderBy: { [input.sortBy]: input.sortOrder },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      this.prisma.package.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return this.prisma.package.findFirst({
      where: { id, deletedAt: null },
      include: { service: { select: { id: true, name: true } } },
    });
  }

  async create(data: CreatePackageInput) {
    return this.prisma.package.create({
      data,
      include: { service: { select: { id: true, name: true } } },
    });
  }

  async update(id: string, data: Omit<UpdatePackageInput, 'id'>) {
    return this.prisma.package.update({
      where: { id },
      data,
      include: { service: { select: { id: true, name: true } } },
    });
  }

  async softDelete(id: string) {
    return this.prisma.package.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async validateService(serviceId: string) {
    return this.prisma.service.findFirst({
      where: { id: serviceId, deletedAt: null },
      select: { id: true },
    });
  }

  async validateLocations(locationIds: string[]) {
    if (locationIds.length === 0) return;
    const count = await this.prisma.location.count({
      where: { id: { in: locationIds }, deletedAt: null },
    });
    if (count !== locationIds.length) {
      throw new Error('INVALID_LOCATIONS');
    }
  }
}
