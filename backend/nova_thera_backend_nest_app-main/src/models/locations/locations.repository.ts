import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../../providers/database/postgres/prisma.service';
import type {
  CreateLocationInput,
  ListLocationsInput,
  UpdateLocationInput,
} from './schemas/location.schema';

@Injectable()
export class LocationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async slugExists(slug: string, excludeId?: string) {
    const existing = await this.prisma.location.findFirst({
      where: {
        slug,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    return Boolean(existing);
  }

  async findMany(input: ListLocationsInput) {
    const where: Prisma.LocationWhereInput = {
      deletedAt: null,
      ...(input.status ? { status: input.status } : {}),
      ...(input.search
        ? {
            OR: [
              { name: { contains: input.search, mode: 'insensitive' } },
              { city: { contains: input.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.location.findMany({
        where,
        orderBy: { [input.sortBy]: input.sortOrder },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      this.prisma.location.count({ where }),
    ]);

    return { items, total };
  }

  async findManyPublic(input: { city?: string; search?: string }) {
    const where: Prisma.LocationWhereInput = {
      deletedAt: null,
      status: 'OPEN',
      serviceLocations: {
        some: {
          isAvailable: true,
          service: { status: 'ACTIVE', deletedAt: null },
        },
      },
      ...(input.city
        ? { city: { equals: input.city, mode: 'insensitive' } }
        : {}),
      ...(input.search
        ? {
            OR: [
              { name: { contains: input.search, mode: 'insensitive' } },
              { city: { contains: input.search, mode: 'insensitive' } },
              { addressLine1: { contains: input.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return this.prisma.location.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        province: true,
        postalCode: true,
        phone: true,
        timezone: true,
        operatingHours: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async distinctCities() {
    const locations = await this.prisma.location.findMany({
      where: {
        deletedAt: null,
        status: 'OPEN',
        serviceLocations: {
          some: {
            isAvailable: true,
            service: { status: 'ACTIVE', deletedAt: null },
          },
        },
      },
      select: { city: true },
      distinct: ['city'],
      orderBy: { city: 'asc' },
    });
    return locations.map((l) => l.city);
  }

  async findById(id: string) {
    return this.prisma.location.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async create(data: CreateLocationInput & { slug: string }) {
    return this.prisma.location.create({ data });
  }

  async update(id: string, data: Omit<UpdateLocationInput, 'id'>) {
    return this.prisma.location.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string) {
    return this.prisma.location.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
