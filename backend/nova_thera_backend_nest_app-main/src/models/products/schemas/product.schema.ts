import { z } from 'zod';
import { paginationInputSchema } from '../../../common/schemas/pagination.schema';

export const productStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']);

const productImageInputSchema = z
  .object({
    url: z.string().url(),
    alt: z.string().max(200).optional(),
    sortOrder: z.number().int().min(0).default(0),
  })
  .strict();

const productBaseSchema = z
  .object({
    name: z.string().min(1).max(200),
    description: z.string().max(10000).optional(),
    ingredients: z.string().max(10000).optional(),
    howToUse: z.string().max(10000).optional(),
    status: productStatusSchema.default('DRAFT'),
    priceCents: z.number().int().positive(),
    currency: z.string().length(3).default('CAD'),
    categoryId: z.string().min(1).nullable().optional(),
    /**
     * Which business sells this product. Required — an unbranded product is
     * money that cannot be attributed or paid out at checkout.
     */
    brandId: z.string().min(1),
    concerns: z.array(z.string().max(100)).max(20).default([]),
    productTypes: z.array(z.string().max(100)).max(20).default([]),
    ingredientsFacet: z.array(z.string().max(100)).max(20).default([]),
    skinTypes: z.array(z.string().max(100)).max(20).default([]),
    images: z.array(productImageInputSchema).default([]),
    inventoryQuantity: z.number().int().min(0).default(0),
    lowStockThreshold: z.number().int().min(0).default(5),
    allowBackorder: z.boolean().default(false),
  })
  .strict();

export const createProductInputSchema = productBaseSchema;

export const updateProductInputSchema = productBaseSchema
  .partial()
  .extend({ id: z.string().min(1) })
  .strict();

export const listProductsInputSchema = paginationInputSchema
  .extend({
    search: z.string().max(200).optional(),
    status: productStatusSchema.optional(),
    categoryId: z.string().min(1).optional(),
    brandId: z.string().min(1).optional(),
    sortBy: z
      .enum(['name', 'createdAt', 'status', 'priceCents'])
      .default('createdAt'),
  })
  .strict();

export const publicListProductsInputSchema = paginationInputSchema
  .extend({
    search: z.string().max(200).optional(),
    concerns: z.array(z.string().max(100)).optional(),
    productTypes: z.array(z.string().max(100)).optional(),
    ingredientsFacet: z.array(z.string().max(100)).optional(),
    skinTypes: z.array(z.string().max(100)).optional(),
    categoryId: z.string().min(1).optional(),
    brandIds: z.array(z.string().min(1)).optional(),
    sortBy: z.enum(['name', 'createdAt', 'priceCents']).default('createdAt'),
  })
  .strict();

export const productIdInputSchema = z
  .object({ id: z.string().min(1) })
  .strict();

export const productSlugInputSchema = z
  .object({ slug: z.string().min(1) })
  .strict();

export const reorderImagesInputSchema = z
  .object({
    productId: z.string().min(1),
    imageIds: z.array(z.string().min(1)).min(1),
  })
  .strict();

export const setInventoryInputSchema = z
  .object({
    productId: z.string().min(1),
    quantity: z.number().int().min(0),
    lowStockThreshold: z.number().int().min(0).optional(),
    allowBackorder: z.boolean().optional(),
  })
  .strict();

export const createProductCategoryInputSchema = z
  .object({
    name: z.string().min(1).max(120),
  })
  .strict();

export type CreateProductInput = z.infer<typeof createProductInputSchema>;
export type UpdateProductInput = z.infer<typeof updateProductInputSchema>;
export type ListProductsInput = z.infer<typeof listProductsInputSchema>;
export type PublicListProductsInput = z.infer<
  typeof publicListProductsInputSchema
>;
export type ReorderImagesInput = z.infer<typeof reorderImagesInputSchema>;
export type SetInventoryInput = z.infer<typeof setInventoryInputSchema>;
export type CreateProductCategoryInput = z.infer<
  typeof createProductCategoryInputSchema
>;
