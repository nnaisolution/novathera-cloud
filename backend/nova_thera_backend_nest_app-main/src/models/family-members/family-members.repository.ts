import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../providers/database/postgres/prisma.service';
import type {
  CreateFamilyMemberInput,
  UpdateFamilyMemberInput,
} from './schemas/family-member.schema';

@Injectable()
export class FamilyMembersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyForOwner(ownerUserId: string) {
    return this.prisma.familyMember.findMany({
      where: { ownerUserId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findByIdForOwner(id: string, ownerUserId: string) {
    return this.prisma.familyMember.findFirst({
      where: { id, ownerUserId, deletedAt: null },
    });
  }

  async countVisitsThisYear(familyMemberId: string) {
    const year = new Date().getFullYear();
    return this.prisma.booking.count({
      where: {
        familyMemberId,
        startTime: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) },
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
    });
  }

  async create(ownerUserId: string, data: CreateFamilyMemberInput) {
    return this.prisma.familyMember.create({
      data: { ownerUserId, ...data },
    });
  }

  async update(id: string, data: Omit<UpdateFamilyMemberInput, 'id'>) {
    return this.prisma.familyMember.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return this.prisma.familyMember.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
