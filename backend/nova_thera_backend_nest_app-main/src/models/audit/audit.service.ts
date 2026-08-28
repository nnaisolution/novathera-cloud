import { Injectable, Logger } from '@nestjs/common';
import { paginatedResponse } from '../../common/schemas/pagination.schema';
import {
  AuditRepository,
  type AuditEntryInput,
} from './audit.repository';
import type { ListAuditInput } from './schemas/audit.schema';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly repository: AuditRepository) {}

  /**
   * Recording an audit entry must never break the action being audited — a
   * failed write is logged and swallowed rather than rolled back into the
   * caller. The alternative (failing a ban because logging broke) is worse.
   */
  async record(entry: AuditEntryInput) {
    try {
      await this.repository.create(entry);
    } catch (error) {
      this.logger.error(
        `Failed to write audit entry "${entry.action}": ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async list(input: ListAuditInput) {
    const { items, total } = await this.repository.findMany(input);
    return paginatedResponse(items, total, input.page, input.limit);
  }

  async actors() {
    return this.repository.distinctActors(50);
  }
}
