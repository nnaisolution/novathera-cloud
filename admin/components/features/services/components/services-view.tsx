'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { IconChevronDown, IconChevronUp, IconPlus, IconTool } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePermission } from '@/lib/auth/use-permission'
import { useTRPC } from '@/lib/trpc/client'
import { useServiceMutations } from '../hooks/use-service-mutations'

export function ServicesView() {
  const trpc = useTRPC()
  const canWrite = usePermission('service', 'create')
  const { data: servicesData } = useQuery(trpc.services.list.queryOptions({ page: 1, limit: 50 }))
  const { data: categoriesData } = useQuery(trpc.serviceCategories.list.queryOptions())
  const { data: packagesData } = useQuery(trpc.packages.list.queryOptions({ page: 1, limit: 50 }))
  const { data: locationsData } = useQuery(trpc.locations.list.queryOptions({ page: 1, limit: 100 }))

  const services = servicesData as {
    items: Array<{
      id: string; name: string; categoryId: string; category: { name: string }
      durationMinutes: number; standardPriceCents: number; status: string
    }>
  } | undefined
  const categories = categoriesData as Array<{ id: string; name: string; displayOrder: number; status: string }> | undefined
  const packages = packagesData as { items: Array<{ id: string; name: string; service: { name: string }; sessionCount: number; priceCents: number; status: string }> } | undefined

  const mutations = useServiceMutations()
  const [categoryName, setCategoryName] = useState('')
  const [pkgForm, setPkgForm] = useState({ name: '', serviceId: '', sessionCount: 6, price: 0, validityDays: 180, locationIds: [] as string[], status: 'ACTIVE' as const })

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>Services</h1>
        <p className='text-muted-foreground text-sm'>Manage service categories, offerings, and packages.</p>
      </div>

      <Tabs defaultValue='services'>
        <TabsList>
          <TabsTrigger value='services'>Services</TabsTrigger>
          <TabsTrigger value='categories'>Categories</TabsTrigger>
          <TabsTrigger value='packages'>Packages</TabsTrigger>
        </TabsList>

        <TabsContent value='services' className='mt-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle className='flex items-center gap-2 text-base'><IconTool className='size-4' /> Services</CardTitle>
              {canWrite && (
                <Link href='/services/new' className={cn(buttonVariants())}>
                  <IconPlus className='size-4' /> Add Service
                </Link>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    {canWrite && <TableHead />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services?.items.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className='font-medium'>{s.name}</TableCell>
                      <TableCell>{s.category.name}</TableCell>
                      <TableCell>{s.durationMinutes} min</TableCell>
                      <TableCell>${(s.standardPriceCents / 100).toFixed(2)}</TableCell>
                      <TableCell><Badge variant='secondary'>{s.status}</Badge></TableCell>
                      {canWrite && (
                        <TableCell>
                          <Link
                            href={`/services/${s.id}/edit`}
                            className={cn(
                              buttonVariants({ size: 'sm', variant: 'ghost' }),
                            )}
                          >
                            Edit
                          </Link>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='categories' className='mt-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>Categories</CardTitle>
              {canWrite && (
                <div className='flex gap-2'>
                  <Input placeholder='Category name' value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className='w-48' />
                  <Button onClick={async () => { if (categoryName) { await mutations.createCategory({ name: categoryName, displayOrder: (categories?.length ?? 0), status: 'ACTIVE' }); setCategoryName('') } }}>Add</Button>
                </div>
              )}
            </CardHeader>
            <CardContent className='space-y-2'>
              {categories?.map((cat, index) => (
                <div key={cat.id} className='flex items-center justify-between rounded-lg border p-3'>
                  <div className='flex items-center gap-2'>
                    <Badge variant='outline'>{cat.displayOrder}</Badge>
                    <span className='font-medium'>{cat.name}</span>
                    <Badge variant='secondary'>{cat.status}</Badge>
                  </div>
                  {canWrite && (
                    <div className='flex gap-1'>
                      <Button size='icon' variant='ghost' disabled={index === 0} onClick={() => {
                        const ids = categories.map((c) => c.id)
                        ;[ids[index - 1], ids[index]] = [ids[index], ids[index - 1]]
                        void mutations.reorderCategories(ids)
                      }}><IconChevronUp className='size-4' /></Button>
                      <Button size='icon' variant='ghost' disabled={index === (categories.length - 1)} onClick={() => {
                        const ids = categories.map((c) => c.id)
                        ;[ids[index], ids[index + 1]] = [ids[index + 1], ids[index]]
                        void mutations.reorderCategories(ids)
                      }}><IconChevronDown className='size-4' /></Button>
                      <Button size='sm' variant='ghost' onClick={() => mutations.deleteCategory(cat.id)}>Delete</Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='packages' className='mt-4'>
          <Card>
            <CardHeader><CardTitle>Packages</CardTitle></CardHeader>
            <CardContent className='space-y-4'>
              {canWrite && (
                <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                  <Input placeholder='Package name' value={pkgForm.name} onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })} />
                  <Select items={services?.items.map((s) => ({ value: s.id, label: s.name }))} value={pkgForm.serviceId} onValueChange={(v) => setPkgForm({ ...pkgForm, serviceId: v ?? '' })}>
                    <SelectTrigger><SelectValue placeholder='Service' /></SelectTrigger>
                    <SelectContent>{services?.items.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input type='number' placeholder='Sessions' value={pkgForm.sessionCount} onChange={(e) => setPkgForm({ ...pkgForm, sessionCount: Number(e.target.value) })} />
                  <Input type='number' placeholder='Price ($)' value={pkgForm.price || ''} onChange={(e) => setPkgForm({ ...pkgForm, price: Number(e.target.value) })} />
                  <Button onClick={async () => { await mutations.createPackage(pkgForm); setPkgForm({ name: '', serviceId: '', sessionCount: 6, price: 0, validityDays: 180, locationIds: [], status: 'ACTIVE' }) }}>Add Package</Button>
                </div>
              )}
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Service</TableHead><TableHead>Sessions</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {packages?.items.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.service.name}</TableCell>
                      <TableCell>{p.sessionCount}</TableCell>
                      <TableCell>${(p.priceCents / 100).toFixed(2)}</TableCell>
                      <TableCell><Badge>{p.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
