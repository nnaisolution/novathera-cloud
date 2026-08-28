'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useBrandOptions } from '@/lib/hooks/use-brand-options'
import { useProductCategories } from '../hooks/use-product-categories'
import type { ProductFormValues } from '../schemas/product.schema'
import { ProductImagesField } from './product-images-field'

type ProductFormProps = {
  values: ProductFormValues
  onChange: (values: ProductFormValues) => void
  submitLabel: string
  isSubmitting?: boolean
  slug?: string
  onSubmit: () => Promise<void>
  onCancel: () => void
}

export function ProductForm({
  values,
  onChange,
  submitLabel,
  isSubmitting,
  slug,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const { brands, isLoading: brandsLoading } = useBrandOptions()
  const { categories, isLoading: categoriesLoading } = useProductCategories()

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <Label>Name</Label>
        <Input
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
        />
      </div>

      {slug ? (
        <div className='space-y-2'>
          <Label>Slug</Label>
          <Input value={slug} disabled className='font-mono text-sm' />
          <p className='text-muted-foreground text-xs'>
            Auto-generated from the product name.
          </p>
        </div>
      ) : (
        <p className='text-muted-foreground text-xs'>
          Slug is generated automatically from the name on save.
        </p>
      )}

      <div className='space-y-2'>
        <Label>Description</Label>
        <Textarea
          value={values.description}
          onChange={(e) =>
            onChange({ ...values, description: e.target.value })
          }
          rows={3}
        />
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
        <div className='space-y-2'>
          <Label>Ingredients</Label>
          <Textarea
            value={values.ingredients}
            onChange={(e) =>
              onChange({ ...values, ingredients: e.target.value })
            }
            rows={3}
          />
        </div>
        <div className='space-y-2'>
          <Label>How to use</Label>
          <Textarea
            value={values.howToUse}
            onChange={(e) => onChange({ ...values, howToUse: e.target.value })}
            rows={3}
          />
        </div>
      </div>

      <div className='grid gap-3 sm:grid-cols-2'>
        <div className='space-y-2'>
          <Label>Price ($)</Label>
          <Input
            type='number'
            step='0.01'
            min='0'
            value={values.price || ''}
            onChange={(e) =>
              onChange({ ...values, price: Number(e.target.value) })
            }
          />
        </div>
        <div className='space-y-2'>
          <Label>Status</Label>
          <Select
            value={values.status}
            onValueChange={(v) =>
              onChange({
                ...values,
                status: v as ProductFormValues['status'],
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='DRAFT'>Draft</SelectItem>
              <SelectItem value='ACTIVE'>Active</SelectItem>
              <SelectItem value='ARCHIVED'>Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-2'>
          <Label>Brand</Label>
          <Select
            value={values.brandId}
            onValueChange={(v) => onChange({ ...values, brandId: v ?? '' })}
            disabled={brandsLoading || brands.length === 0}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  brandsLoading
                    ? 'Loading brands'
                    : brands.length === 0
                      ? 'No brands — create one first'
                      : 'Select a brand'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className='text-muted-foreground text-xs'>
            Which business sells this product. Determines who gets paid at
            checkout.
          </p>
        </div>
        <div className='space-y-2'>
          <Label>Category</Label>
          <Select
            value={values.categoryId || 'none'}
            onValueChange={(v) =>
              onChange({ ...values, categoryId: !v || v === 'none' ? '' : v })
            }
            disabled={categoriesLoading}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  categoriesLoading ? 'Loading categories' : 'Optional category'
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='none'>No category</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className='text-muted-foreground text-xs'>
            Used for shop browsing. Create categories by seeding or via the API
            if the list is empty.
          </p>
        </div>
      </div>

      <div className='grid gap-3 sm:grid-cols-2'>
        <div className='space-y-2'>
          <Label>Concerns</Label>
          <Input
            value={values.concerns}
            onChange={(e) => onChange({ ...values, concerns: e.target.value })}
            placeholder='Hydration, Aging'
          />
        </div>
        <div className='space-y-2'>
          <Label>Product types</Label>
          <Input
            value={values.productTypes}
            onChange={(e) =>
              onChange({ ...values, productTypes: e.target.value })
            }
            placeholder='Serum, Moisturizer'
          />
        </div>
        <div className='space-y-2'>
          <Label>Ingredient facets</Label>
          <Input
            value={values.ingredientsFacet}
            onChange={(e) =>
              onChange({ ...values, ingredientsFacet: e.target.value })
            }
            placeholder='Niacinamide, Green Tea'
          />
        </div>
        <div className='space-y-2'>
          <Label>Skin types</Label>
          <Input
            value={values.skinTypes}
            onChange={(e) => onChange({ ...values, skinTypes: e.target.value })}
            placeholder='Dry, Combination'
          />
        </div>
      </div>

      <ProductImagesField
        images={values.images}
        onChange={(images) => onChange({ ...values, images })}
      />

      <div className='grid gap-3 sm:grid-cols-3'>
        <div className='space-y-2'>
          <Label>Inventory quantity</Label>
          <Input
            type='number'
            min='0'
            value={values.inventoryQuantity}
            onChange={(e) =>
              onChange({
                ...values,
                inventoryQuantity: Number(e.target.value),
              })
            }
          />
        </div>
        <div className='space-y-2'>
          <Label>Low stock threshold</Label>
          <Input
            type='number'
            min='0'
            value={values.lowStockThreshold}
            onChange={(e) =>
              onChange({
                ...values,
                lowStockThreshold: Number(e.target.value),
              })
            }
          />
        </div>
        <div className='flex items-end gap-2 pb-2'>
          <Switch
            checked={values.allowBackorder}
            onCheckedChange={(v) =>
              onChange({ ...values, allowBackorder: v })
            }
          />
          <Label>Allow backorder</Label>
        </div>
      </div>

      <div className='flex gap-3'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button
          disabled={isSubmitting || !values.brandId}
          onClick={() => void onSubmit()}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}
