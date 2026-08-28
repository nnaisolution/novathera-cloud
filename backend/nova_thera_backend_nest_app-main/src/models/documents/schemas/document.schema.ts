import { z } from 'zod';
import { paginationInputSchema } from '../../../common/schemas/pagination.schema';

export const documentCategorySchema = z.enum([
  'ASSESSMENT',
  'LAB',
  'PROTOCOL',
  'CONSENT',
  'GUIDE',
  'OTHER',
]);

export const createDocumentInputSchema = z
  .object({
    customerUserId: z.string().min(1),
    title: z.string().trim().min(1).max(300),
    category: documentCategorySchema.default('OTHER'),
    // Either a Cloud Storage object path (private documents bucket) or an
    // absolute URL. Paths are resolved to a short-lived signed URL on read.
    fileUrl: z.string().min(1).max(1024),
    fileSizeBytes: z.number().int().positive().optional(),
  })
  .strict();

export const updateDocumentInputSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().trim().min(1).max(300).optional(),
    category: documentCategorySchema.optional(),
  })
  .strict();

export const documentIdInputSchema = z
  .object({ id: z.string().min(1) })
  .strict();

export const listDocumentsInputSchema = paginationInputSchema.extend({
  customerUserId: z.string().min(1).optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentInputSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentInputSchema>;
export type ListDocumentsInput = z.infer<typeof listDocumentsInputSchema>;
