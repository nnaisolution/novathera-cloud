import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../../providers/database/postgres/prisma.service';
import { ASSIGNABLE_ROLES, type ListStaffInput } from './schemas/staff.schema';

@Injectable()
export class StaffRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(input: ListStaffInput) {
    const where: Prisma.UserWhereInput = {
      ...(input.role
        ? { role: input.role }
        : input.includeCustomers
          ? {}
          : { role: { in: [...ASSIGNABLE_ROLES] } }),
      ...(input.search
        ? {
            OR: [
              { name: { contains: input.search, mode: 'insensitive' } },
              { email: { contains: input.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
          banned: true,
          banReason: true,
          banExpires: true,
          image: true,
          createdAt: true,
          _count: { select: { sessions: true } },
        },
        orderBy: { createdAt: input.sortOrder },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: items.map(({ _count, ...user }) => ({
        ...user,
        activeSessions: _count.sessions,
      })),
      total,
    };
  }

  async findById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, banned: true },
    });
  }

  /** Sessions that have not yet expired, newest first. */
  async findActiveSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        token: true,
        createdAt: true,
        expiresAt: true,
        ipAddress: true,
        userAgent: true,
        impersonatedBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Staff accounts are created by an admin who has already vouched for the
   * person, so they skip the email round-trip. Without this the account is
   * unusable: `requireEmailVerification` rejects sign-in with EMAIL_NOT_VERIFIED
   * and no verification mail is ever sent for admin-created users.
   */
  /**
   * Promotes a freshly self-registered account to admin.
   *
   * Better Auth's public sign-up always lands on the customer role, so the
   * open admin registration flow has to raise it afterwards.
   */
  async promoteToAdmin(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: 'admin' },
      select: { id: true, email: true, name: true, role: true },
    });
  }

  async countAdmins() {
    return this.prisma.user.count({ where: { role: 'admin' } });
  }

  async markEmailVerified(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
      select: { id: true, email: true, emailVerified: true },
    });
  }

  async roleCounts() {
    const rows = await this.prisma.user.groupBy({
      by: ['role'],
      _count: { _all: true },
    });

    return rows.map((row) => ({
      role: row.role ?? 'unknown',
      count: row._count._all,
    }));
  }
}
