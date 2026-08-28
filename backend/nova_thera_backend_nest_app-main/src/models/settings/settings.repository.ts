import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../providers/database/postgres/prisma.service';
import type { SettingGroup } from './schemas/settings.schema';

@Injectable()
export class SettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.appSetting.findMany();
  }

  async upsert(key: SettingGroup, value: unknown, updatedBy: string | null) {
    return this.prisma.appSetting.upsert({
      where: { key },
      create: { key, value: value as object, updatedBy },
      update: { value: value as object, updatedBy },
    });
  }
}
