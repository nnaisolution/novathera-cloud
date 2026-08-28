import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { GcsStorageService } from '../../providers/storage/gcs/storage.service';
import type {
  CreateDocumentUploadUrlInput,
  CreateProductImageUploadUrlInput,
} from './schemas/storage.schema';

@Injectable()
export class StorageService {
  constructor(private readonly gcs: GcsStorageService) {}

  /** Lets the admin UI show a useful message instead of failing on upload. */
  status() {
    return { enabled: this.gcs.isEnabled };
  }

  private assertEnabled() {
    if (!this.gcs.isEnabled) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'File storage is not configured',
      });
    }
  }

  async createProductImageUploadUrl(input: CreateProductImageUploadUrlInput) {
    this.assertEnabled();

    try {
      return await this.gcs.createUploadUrl({
        target: 'productImage',
        filename: input.filename,
        contentType: input.contentType,
      });
    } catch {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not prepare the upload. Please try again.',
      });
    }
  }

  async createDocumentUploadUrl(input: CreateDocumentUploadUrlInput) {
    this.assertEnabled();

    try {
      return await this.gcs.createUploadUrl({
        target: 'document',
        filename: input.filename,
        contentType: input.contentType,
        scopeId: input.customerUserId,
      });
    } catch {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not prepare the upload. Please try again.',
      });
    }
  }
}
