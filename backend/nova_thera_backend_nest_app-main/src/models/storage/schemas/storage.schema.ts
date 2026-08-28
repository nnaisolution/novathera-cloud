import { z } from 'zod';

/**
 * Upload constraints are enforced here, server side, because the signed URL is
 * the actual capability being handed out. The browser cannot widen them: the
 * signature is bound to the content type, and the bucket rejects a mismatch.
 */
export const PRODUCT_IMAGE_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
] as const;

export const DOCUMENT_CONTENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
] as const;

export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;

export const createProductImageUploadUrlInputSchema = z
  .object({
    filename: z.string().min(1).max(300),
    contentType: z.enum(PRODUCT_IMAGE_CONTENT_TYPES),
    sizeBytes: z.number().int().positive().max(PRODUCT_IMAGE_MAX_BYTES),
  })
  .strict();

export const createDocumentUploadUrlInputSchema = z
  .object({
    // Documents are filed against a customer, so the path is scoped to them.
    customerUserId: z.string().min(1),
    filename: z.string().min(1).max(300),
    contentType: z.enum(DOCUMENT_CONTENT_TYPES),
    sizeBytes: z.number().int().positive().max(DOCUMENT_MAX_BYTES),
  })
  .strict();

export type CreateProductImageUploadUrlInput = z.infer<
  typeof createProductImageUploadUrlInputSchema
>;
export type CreateDocumentUploadUrlInput = z.infer<
  typeof createDocumentUploadUrlInputSchema
>;
