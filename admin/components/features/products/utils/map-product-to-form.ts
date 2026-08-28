import type { ProductFormValues } from '../schemas/product.schema'

export const defaultProductFormValues: ProductFormValues = {
  name: '',
  description: '',
  ingredients: '',
  howToUse: '',
  status: 'DRAFT',
  price: 0,
  categoryId: '',
  brandId: '',
  concerns: '',
  productTypes: '',
  ingredientsFacet: '',
  skinTypes: '',
  images: [],
  inventoryQuantity: 0,
  lowStockThreshold: 5,
  allowBackorder: false,
}

function joinFacet(values: string[] | null | undefined) {
  return values?.length ? values.join(', ') : ''
}

type ProductRecord = {
  name: string
  description?: string | null
  ingredients?: string | null
  howToUse?: string | null
  status: string
  priceCents: number
  categoryId?: string | null
  brandId?: string | null
  concerns: string[]
  productTypes: string[]
  ingredientsFacet: string[]
  skinTypes: string[]
  images: Array<{ url: string; alt?: string | null; sortOrder: number }>
  inventory?: {
    quantity: number
    lowStockThreshold: number
    allowBackorder: boolean
  } | null
}

export function mapProductToForm(product: ProductRecord): ProductFormValues {
  return {
    name: product.name,
    description: product.description ?? '',
    ingredients: product.ingredients ?? '',
    howToUse: product.howToUse ?? '',
    status: product.status as ProductFormValues['status'],
    price: product.priceCents / 100,
    categoryId: product.categoryId ?? '',
    brandId: product.brandId ?? '',
    concerns: joinFacet(product.concerns),
    productTypes: joinFacet(product.productTypes),
    ingredientsFacet: joinFacet(product.ingredientsFacet),
    skinTypes: joinFacet(product.skinTypes),
    images: product.images.map((img) => ({
      url: img.url,
      alt: img.alt ?? '',
      sortOrder: img.sortOrder,
    })),
    inventoryQuantity: product.inventory?.quantity ?? 0,
    lowStockThreshold: product.inventory?.lowStockThreshold ?? 5,
    allowBackorder: product.inventory?.allowBackorder ?? false,
  }
}

export function splitFacet(value?: string) {
  if (!value?.trim()) return []
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}
