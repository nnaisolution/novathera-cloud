import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageConfigService {
  constructor(private readonly configService: ConfigService) {}

  get projectId(): string {
    return this.configService.get<string>('storage.projectId', '');
  }

  get documentsBucket(): string {
    return this.configService.get<string>('storage.documentsBucket', '');
  }

  get productImagesBucket(): string {
    return this.configService.get<string>('storage.productImagesBucket', '');
  }

  get credentialsJson(): string {
    return this.configService.get<string>('storage.credentialsJson', '');
  }

  get uploadUrlTtlSeconds(): number {
    return this.configService.get<number>('storage.uploadUrlTtlSeconds', 600);
  }

  get downloadUrlTtlSeconds(): number {
    return this.configService.get<number>('storage.downloadUrlTtlSeconds', 300);
  }

  /** Uploads stay disabled (and the UI says so) until both buckets are set. */
  get isConfigured(): boolean {
    return Boolean(this.documentsBucket && this.productImagesBucket);
  }
}
