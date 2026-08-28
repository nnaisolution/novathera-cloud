import { z } from 'zod'

export const productImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().max(200).optional().or(z.literal('')),
  sortOrder: z.coerce.number().int().min(0).default(0),
})

export const productFormSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(10000).optional().or(z.literal('')),
  ingredients: z.string().max(10000).optional().or(z.literal('')),
  howToUse: z.string().max(10000).optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
  price: z.coerce.number().positive(),
  categoryId: z.string().optional().or(z.literal('')),
  brandId: z.string().min(1, 'Select which business sells this product'),
  concerns: z.string().optional().or(z.literal('')),
  productTypes: z.string().optional().or(z.literal('')),
  ingredientsFacet: z.string().optional().or(z.literal('')),
  skinTypes: z.string().optional().or(z.literal('')),
  images: z.array(productImageSchema).default([]),
  inventoryQuantity: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  allowBackorder: z.boolean().default(false),
})

export type ProductFormValues = z.infer<typeof productFormSchema>
export type ProductImageValue = z.infer<typeof productImageSchema>
