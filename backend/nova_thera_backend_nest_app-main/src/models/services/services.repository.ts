import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../../providers/database/postgres/prisma.service';
import type {
  CreateServiceInput,
  ListServicesInput,
  UpdateServiceInput,
} from './schemas/service.schema';

@Injectable()
export class ServicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly detailInclude = {
    category: true,
    locations: { include: { location: true } },
    staff: {
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          },
        },
      },
    },
  } satisfies Prisma.ServiceInclude;

  private findByIdWith(
    client: PrismaService | Prisma.TransactionClient,
    id: string,
  ) {
    return client.service.findFirst({
      where: { id, deletedAt: null },
      include: this.detailInclude,
    });
  }

  async slugExists(slug: string, excludeId?: string) {
    const existing = await this.prisma.service.findFirst({
      where: {
        slug,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    return Boolean(existing);
  }

  async findMany(input: ListServicesInput) {
    const where: Prisma.ServiceWhereInput = {
      deletedAt: null,
      ...(input.status ? { status: input.status } : {}),
      ...(input.categoryId ? { categoryId: input.categoryId } : {}),
      ...(input.locationId
        ? {
            locations: {
              some: { locationId: input.locationId, isAvailable: true },
            },
          }
        : {}),
      ...(input.search
        ? {
            OR: [
              { name: { contains: input.search, mode: 'insensitive' } },
              {
                shortDescription: {
                  contains: input.search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        include: {
          category: true,
          locations: { include: { location: true } },
          staff: {
            include: {
              employee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  photoUrl: true,
                },
              },
            },
          },
          _count: { select: { packages: true } },
        },
        orderBy: { [input.sortBy]: input.sortOrder },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      this.prisma.service.count({ where }),
    ]);

    return { items, total };
  }

  async findManyPublic(input: {
    categoryId?: string;
    locationId?: string;
    tags?: string[];
  }) {
    const where: Prisma.ServiceWhereInput = {
      deletedAt: null,
      status: 'ACTIVE',
      ...(input.categoryId ? { categoryId: input.categoryId } : {}),
      ...(input.locationId
        ? {
            locations: {
              some: { locationId: input.locationId, isAvailable: true },
            },
          }
        : {}),
      ...(input.tags?.length ? { tags: { hasSome: input.tags } } : {}),
    };

    return this.prisma.service.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        imageUrl: true,
        durationMinutes: true,
        standardPriceCents: true,
        currency: true,
        clientCanChooseStaff: true,
        categoryId: true,
        category: { select: { id: true, name: true } },
        stripeProductId: true,
        stripePriceId: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findPublicFacets() {
    const services = await this.prisma.service.findMany({
      where: { deletedAt: null, status: 'ACTIVE' },
      select: { tags: true },
    });

    const tags = new Set<string>();
    for (const service of services) {
      service.tags.forEach((value) => tags.add(value));
    }

    return { tags: [...tags].sort() };
  }

  async findBySlugPublic(slug: string) {
    return this.prisma.service.findFirst({
      where: { slug, status: 'ACTIVE', deletedAt: null },
      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        detailedDescription: true,
        imageUrl: true,
        tags: true,
        durationMinutes: true,
        standardPriceCents: true,
        memberPriceCents: true,
        currency: true,
        clientCanChooseStaff: true,
        category: { select: { id: true, name: true } },
      },
    });
  }

  async findById(id: string) {
    return this.findByIdWith(this.prisma, id);
  }

  async create(
    data: Omit<CreateServiceInput, 'locations' | 'staffEmployeeIds'> & {
      slug: string;
    },
    locations: CreateServiceInput['locations'],
    staffEmployeeIds: string[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      const service = await tx.service.create({
        data,
      });

      if (locations.length > 0) {
        await tx.serviceLocation.createMany({
          data: locations.map((loc) => ({
            serviceId: service.id,
            ...loc,
          })),
        });
      }

      if (staffEmployeeIds.length > 0) {
        await tx.serviceEmployee.createMany({
          data: staffEmployeeIds.map((employeeId) => ({
            serviceId: service.id,
            employeeId,
          })),
        });
      }

      return this.findByIdWith(tx, service.id);
    });
  }

  async update(
    id: string,
    data: Omit<UpdateServiceInput, 'id' | 'locations' | 'staffEmployeeIds'>,
    locations?: UpdateServiceInput['locations'],
    staffEmployeeIds?: string[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.service.update({ where: { id }, data });

      if (locations !== undefined) {
        await tx.serviceLocation.deleteMany({ where: { serviceId: id } });
        if (locations.length > 0) {
          await tx.serviceLocation.createMany({
            data: locations.map((loc) => ({
              serviceId: id,
              ...loc,
            })),
          });
        }
      }

      if (staffEmployeeIds !== undefined) {
        await tx.serviceEmployee.deleteMany({ where: { serviceId: id } });
        if (staffEmployeeIds.length > 0) {
          await tx.serviceEmployee.createMany({
            data: staffEmployeeIds.map((employeeId) => ({
              serviceId: id,
              employeeId,
            })),
          });
        }
      }

      return this.findByIdWith(tx, id);
    });
  }

  async softDelete(id: string) {
    return this.prisma.service.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async countActivePackages(serviceId: string) {
    return this.prisma.package.count({
      where: {
        serviceId,
        deletedAt: null,
        status: 'ACTIVE',
      },
    });
  }

  async updateStripeIds(
    id: string,
    stripeProductId: string,
    stripePriceId: string,
  ) {
    return this.prisma.service.update({
      where: { id },
      data: { stripeProductId, stripePriceId },
    });
  }

  async validateActiveEmployees(employeeIds: string[]) {
    if (employeeIds.length === 0) return;
    const count = await this.prisma.employee.count({
      where: {
        id: { in: employeeIds },
        status: 'ACTIVE',
        deletedAt: null,
      },
    });
    if (count !== employeeIds.length) {
      throw new Error('INVALID_EMPLOYEES');
    }
  }
}
