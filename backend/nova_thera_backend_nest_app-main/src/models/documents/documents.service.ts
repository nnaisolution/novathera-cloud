import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { paginatedResponse } from '../../common/schemas/pagination.schema';
import { GcsStorageService } from '../../providers/storage/gcs/storage.service';
import { DocumentsRepository } from './documents.repository';
import type {
  CreateDocumentInput,
  ListDocumentsInput,
  UpdateDocumentInput,
} from './schemas/document.schema';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly repository: DocumentsRepository,
    private readonly storage: GcsStorageService,
  ) {}

  /**
   * Mints a short-lived link to a stored document.
   *
   * The documents bucket enforces public access prevention, so a stored path is
   * useless on its own — this is the only way to read one, and it happens only
   * after the caller has been resolved to someone allowed to see this file.
   *
   * `fileUrl` holds an object path for anything uploaded to Cloud Storage. Rows
   * created before the move still hold an absolute URL, which is returned as-is.
   */
  private async toDownloadUrl(fileUrl: string): Promise<string> {
    if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
    return this.storage.createReadUrl('document', fileUrl);
  }

  /** Staff download: gated by `document:read` at the router. */
  async getDownloadUrl(id: string) {
    const document = await this.repository.findById(id);
    if (!document) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' });
    }
    return { url: await this.toDownloadUrl(document.fileUrl) };
  }

  /** Customer download: only ever resolves documents filed against them. */
  async getMyDownloadUrl(id: string, customerUserId: string) {
    const document = await this.getForCustomer(id, customerUserId);
    return { url: await this.toDownloadUrl(document.fileUrl) };
  }

  async listForCustomer(customerUserId: string) {
    return this.repository.findManyForCustomer(customerUserId);
  }

  async getForCustomer(id: string, customerUserId: string) {
    const document = await this.repository.findByIdForCustomer(
      id,
      customerUserId,
    );
    if (!document) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' });
    }
    return document;
  }

  async list(input: ListDocumentsInput) {
    const { items, total } = await this.repository.findMany(input);
    return paginatedResponse(items, total, input.page, input.limit);
  }

  async create(
    input: CreateDocumentInput,
    uploadedByEmployeeId?: string,
  ) {
    return this.repository.create({ ...input, uploadedByEmployeeId });
  }

  async update(input: UpdateDocumentInput) {
    const existing = await this.repository.findById(input.id);
    if (!existing) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' });
    }
    const { id, ...data } = input;
    return this.repository.update(id, data);
  }

  async delete(id: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Document not found' });
    }
    return this.repository.delete(id);
  }
}
