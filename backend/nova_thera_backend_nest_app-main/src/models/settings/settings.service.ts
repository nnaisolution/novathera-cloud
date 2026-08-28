import { Injectable, Logger } from '@nestjs/common';
import { SettingsRepository } from './settings.repository';
import {
  SETTING_SCHEMAS,
  defaultSettings,
  type SettingGroup,
  type SettingsBundle,
  type UpdateSettingsInput,
} from './schemas/settings.schema';

/**
 * Settings are read on nearly every dashboard request, so they are cached in
 * process and invalidated on write. The TTL is a backstop for the case where
 * another process (a migration, a second instance) changes a row.
 */
const CACHE_TTL_MS = 30_000;

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);
  private cache: { bundle: SettingsBundle; expiresAt: number } | null = null;

  constructor(private readonly repository: SettingsRepository) {}

  async getAll(): Promise<SettingsBundle> {
    if (this.cache && this.cache.expiresAt > Date.now()) {
      return this.cache.bundle;
    }

    const bundle = defaultSettings();
    const rows = await this.repository.findAll();

    for (const row of rows) {
      const group = row.key as SettingGroup;
      const schema = SETTING_SCHEMAS[group];
      if (!schema) continue;

      const parsed = schema.safeParse(row.value);
      if (parsed.success) {
        // Assigning through the bundle keeps each group's own type.
        (bundle as Record<string, unknown>)[group] = parsed.data;
      } else {
        // A malformed row must not take the API down — fall back to defaults
        // for that group only and make the problem visible in the logs.
        this.logger.warn(
          `Ignoring invalid stored settings for "${group}": ${parsed.error.message}`,
        );
      }
    }

    this.cache = { bundle, expiresAt: Date.now() + CACHE_TTL_MS };
    return bundle;
  }

  /** Typed accessor for a single group, for use by other services. */
  async get<G extends SettingGroup>(group: G): Promise<SettingsBundle[G]> {
    const bundle = await this.getAll();
    return bundle[group];
  }

  async update(input: UpdateSettingsInput, actorUserId: string | null) {
    await this.repository.upsert(input.group, input.values, actorUserId);
    this.cache = null;
    return this.getAll();
  }

  invalidate() {
    this.cache = null;
  }
}
