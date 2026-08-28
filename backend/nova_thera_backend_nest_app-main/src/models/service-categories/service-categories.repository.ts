import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../providers/database/postgres/prisma.service';
import type {
  CreateServiceCategoryInput,
  UpdateServiceCategoryInput,
} from './schemas/service-category.schema';

@Injectable()
export class ServiceCategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPublic() {
    return this.prisma.serviceCategory.findMany({
      where: { deletedAt: null, status: 'ACTIVE' },
      orderBy: { displayOrder: 'asc' },
      select: { id: true, name: true, iconUrl: true },
    });
  }

  async findAll() {
    return this.prisma.serviceCategory.findMany({
      where: { deletedAt: null },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.serviceCategory.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async create(data: CreateServiceCategoryInput) {
    return this.prisma.serviceCategory.create({ data });
  }

  async update(id: string, data: Omit<UpdateServiceCategoryInput, 'id'>) {
    return this.prisma.serviceCategory.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return this.prisma.serviceCategory.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async reorder(orderedIds: string[]) {
    return this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.serviceCategory.update({
          where: { id },
          data: { displayOrder: index },
        }),
      ),
    );
  }
}
