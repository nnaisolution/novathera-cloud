import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../../providers/database/postgres/prisma.service';
import type { ListAuditInput } from './schemas/audit.schema';

export type AuditEntryInput = {
  action: string;
  summary: string;
  actorUserId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  targetLabel?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(entry: AuditEntryInput) {
    return this.prisma.auditLog.create({
      data: {
        action: entry.action,
        summary: entry.summary,
        actorUserId: entry.actorUserId ?? null,
        actorEmail: entry.actorEmail ?? null,
        actorRole: entry.actorRole ?? null,
        targetType: entry.targetType ?? null,
        targetId: entry.targetId ?? null,
        targetLabel: entry.targetLabel ?? null,
        metadata: (entry.metadata ?? undefined) as
          | Prisma.InputJsonValue
          | undefined,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ?? null,
      },
    });
  }

  async findMany(input: ListAuditInput) {
    const where: Prisma.AuditLogWhereInput = {
      ...(input.action ? { action: input.action } : {}),
      ...(input.actorUserId ? { actorUserId: input.actorUserId } : {}),
      ...(input.from || input.to
        ? {
            createdAt: {
              ...(input.from ? { gte: input.from } : {}),
              ...(input.to ? { lte: input.to } : {}),
            },
          }
        : {}),
      ...(input.search
        ? {
            OR: [
              { summary: { contains: input.search, mode: 'insensitive' } },
              { actorEmail: { contains: input.search, mode: 'insensitive' } },
              { targetLabel: { contains: input.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: input.sortOrder },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total };
  }

  async distinctActors(limit: number) {
    const rows = await this.prisma.auditLog.findMany({
      where: { actorUserId: { not: null } },
      select: { actorUserId: true, actorEmail: true },
      distinct: ['actorUserId'],
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) => ({
      id: row.actorUserId as string,
      email: row.actorEmail ?? 'unknown',
    }));
  }
}
