export type ShopCategory = {
  id: string
  name: string
  slug: string
}

export type ShopProductImage = {
  url: string
  alt: string | null
}

export type ShopProduct = {
  id: string
  name: string
  slug: string
  description: string | null
  ingredients: string | null
  howToUse: string | null
  priceCents: number
  currency: string
  stockAvailable: boolean
  category: ShopCategory | null
  brand: { name: string } | null
  images: ShopProductImage[]
}
