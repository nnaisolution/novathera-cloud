'use client'

import Link from 'next/link'
import { IconPackage, IconPlus } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { usePermission } from '@/lib/auth/use-permission'
import { cn } from '@/lib/utils'
import { useProductMutations } from '../hooks/use-product-mutations'
import { useProductCategories } from '../hooks/use-product-categories'
import { useProducts } from '../hooks/use-products'

function formatMoney(cents: number, currency = 'CAD') {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

export function ProductsView() {
  const canCreate = usePermission('product', 'create')
  const canUpdate = usePermission('product', 'update')
  const {
    data,
    isLoading,
    page,
    setPage,
    search,
    setSearch,
    status,
    setStatus,
    categoryId,
    setCategoryId,
  } = useProducts()
  const { categories } = useProductCategories()
  const { archiveProduct, publishProduct } = useProductMutations()

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Products</h1>
          <p className='text-muted-foreground text-sm'>
            Manage shop catalog, pricing, and stock levels.
          </p>
        </div>
        {canCreate && (
          <Link href='/products/new' className={cn(buttonVariants())}>
            <IconPlus className='size-4' /> Add Product
          </Link>
        )}
      </div>

      <Card>
        <CardHeader className='flex flex-row flex-wrap items-center justify-between gap-4'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <IconPackage className='size-4' /> All Products
          </CardTitle>
          <div className='flex flex-wrap gap-2'>
            <Input
              placeholder='Search products…'
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className='w-56'
            />
            <Select
              value={status ?? 'all'}
              onValueChange={(v) => {
                setStatus(
                  v === 'all'
                    ? undefined
                    : (v as 'DRAFT' | 'ACTIVE' | 'ARCHIVED'),
                )
                setPage(1)
              }}
            >
              <SelectTrigger className='w-36'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All statuses</SelectItem>
                <SelectItem value='ACTIVE'>Active</SelectItem>
                <SelectItem value='DRAFT'>Draft</SelectItem>
                <SelectItem value='ARCHIVED'>Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={categoryId ?? 'all'}
              onValueChange={(v) => {
                setCategoryId(!v || v === 'all' ? undefined : v)
                setPage(1)
              }}
            >
              <SelectTrigger className='w-44'>
                <SelectValue placeholder='Category' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='space-y-2'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          ) : !data?.items.length ? (
            <p className='text-muted-foreground py-8 text-center text-sm'>
              No products found.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    {canUpdate && <TableHead />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((product) => {
                    const qty = product.inventory?.quantity ?? 0
                    const low = product.inventory?.lowStockThreshold ?? 5
                    const lowStock = qty <= low
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className='flex items-center gap-3'>
                            {product.images[0]?.url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={product.images[0].url}
                                alt={product.images[0].alt || product.name}
                                className='size-10 rounded object-cover'
                              />
                            ) : (
                              <div className='bg-muted text-muted-foreground flex size-10 items-center justify-center rounded text-xs'>
                                —
                              </div>
                            )}
                            <div>
                              <div className='font-medium'>{product.name}</div>
                              <div className='text-muted-foreground font-mono text-xs'>
                                {product.slug}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.category?.name ?? (
                            <span className='text-muted-foreground'>—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant='secondary'>{product.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {formatMoney(product.priceCents, product.currency)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              lowStock ? 'text-destructive font-medium' : ''
                            }
                          >
                            {qty}
                          </span>
                          {lowStock && (
                            <span className='text-muted-foreground ml-1 text-xs'>
                              low
                            </span>
                          )}
                        </TableCell>
                        {canUpdate && (
                          <TableCell>
                            <div className='flex gap-1'>
                              <Link
                                href={`/products/${product.id}/edit`}
                                className={cn(
                                  buttonVariants({
                                    size: 'sm',
                                    variant: 'ghost',
                                  }),
                                )}
                              >
                                Edit
                              </Link>
                              {product.status === 'DRAFT' && (
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  onClick={() =>
                                    void publishProduct(product.id)
                                  }
                                >
                                  Publish
                                </Button>
                              )}
                              {product.status !== 'ARCHIVED' && (
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  onClick={() =>
                                    void archiveProduct(product.id)
                                  }
                                >
                                  Archive
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              {data.totalPages > 1 && (
                <div className='mt-4 flex justify-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className='text-muted-foreground flex items-center text-sm'>
                    Page {page} of {data.totalPages}
                  </span>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={page >= data.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
