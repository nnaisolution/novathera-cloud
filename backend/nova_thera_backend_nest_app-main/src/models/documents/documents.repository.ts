import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../../providers/database/postgres/prisma.service';
import type {
  CreateDocumentInput,
  ListDocumentsInput,
  UpdateDocumentInput,
} from './schemas/document.schema';

@Injectable()
export class DocumentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyForCustomer(customerUserId: string) {
    return this.prisma.document.findMany({
      where: { customerUserId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdForCustomer(id: string, customerUserId: string) {
    return this.prisma.document.findFirst({
      where: { id, customerUserId },
    });
  }

  async findMany(input: ListDocumentsInput) {
    const where: Prisma.DocumentWhereInput = {
      ...(input.customerUserId
        ? { customerUserId: input.customerUserId }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        include: { customer: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: input.sortOrder },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      this.prisma.document.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return this.prisma.document.findFirst({ where: { id } });
  }

  async create(
    data: CreateDocumentInput & { uploadedByEmployeeId?: string },
  ) {
    const { customerUserId, uploadedByEmployeeId, ...rest } = data;
    return this.prisma.document.create({
      data: {
        ...rest,
        customer: { connect: { id: customerUserId } },
        ...(uploadedByEmployeeId
          ? { uploadedByEmployee: { connect: { id: uploadedByEmployeeId } } }
          : {}),
      },
    });
  }

  async update(id: string, data: Omit<UpdateDocumentInput, 'id'>) {
    return this.prisma.document.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.document.delete({ where: { id } });
  }
}
