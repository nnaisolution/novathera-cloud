import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../../providers/database/postgres/prisma.service';
import type {
  CreateEmployeeInput,
  ListEmployeesInput,
  UpdateEmployeeInput,
} from './schemas/employee.schema';

@Injectable()
export class EmployeesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getNextEmployeeCode() {
    const rows = await this.prisma.$queryRaw<Array<{ nextval: bigint }>>`
      SELECT nextval('employee_code_seq') AS nextval
    `;
    return `NT-${String(rows[0].nextval).padStart(4, '0')}`;
  }

  async findUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, banned: true },
    });
  }

  async findMany(input: ListEmployeesInput) {
    const where: Prisma.EmployeeWhereInput = {
      deletedAt: null,
      ...(input.status ? { status: input.status } : {}),
      ...(input.department ? { department: input.department } : {}),
      ...(input.locationId ? { locationId: input.locationId } : {}),
      ...(input.employmentType ? { employmentType: input.employmentType } : {}),
      ...(input.search
        ? {
            OR: [
              { firstName: { contains: input.search, mode: 'insensitive' } },
              { lastName: { contains: input.search, mode: 'insensitive' } },
              { employeeCode: { contains: input.search, mode: 'insensitive' } },
              { jobTitle: { contains: input.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        include: {
          location: true,
          certifications: true,
        },
        orderBy: { [input.sortBy]: input.sortOrder },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      this.prisma.employee.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string) {
    return this.prisma.employee.findFirst({
      where: { id, deletedAt: null },
      include: {
        location: true,
        certifications: true,
      },
    });
  }

  async create(
    data: Omit<CreateEmployeeInput, 'certifications' | 'workEmail' | 'role'> & {
      userId: string;
      employeeCode: string;
    },
    certifications: CreateEmployeeInput['certifications'],
  ) {
    return this.prisma.employee.create({
      data: {
        ...data,
        certifications: {
          create: certifications,
        },
      },
      include: {
        location: true,
        certifications: true,
      },
    });
  }

  async update(
    id: string,
    data: Omit<
      UpdateEmployeeInput,
      'id' | 'certifications' | 'workEmail' | 'role'
    > & { status?: 'ACTIVE' | 'INACTIVE' },
    certifications?: UpdateEmployeeInput['certifications'],
  ) {
    return this.prisma.$transaction(async (tx) => {
      if (certifications) {
        await tx.employeeCertification.deleteMany({
          where: { employeeId: id },
        });
      }

      return tx.employee.update({
        where: { id },
        data: {
          ...data,
          ...(certifications
            ? {
                certifications: {
                  create: certifications,
                },
              }
            : {}),
        },
        include: {
          location: true,
          certifications: true,
        },
      });
    });
  }

  async softDelete(id: string) {
    return this.prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });
  }
}
