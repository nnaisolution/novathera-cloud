'use client'

import { useRef, useState } from 'react'
import { format } from 'date-fns'
import {
  IconDownload,
  IconFileText,
  IconTrash,
  IconUpload,
} from '@tabler/icons-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  useDocumentUpload,
  useStorageEnabled,
} from '@/lib/hooks/use-storage-upload'
import { useCustomers } from '@/components/features/customers/hooks/use-customers'
import { useDocumentMutations, useDocumentsList } from '../hooks/use-documents'
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_LABELS,
  type DocumentCategory,
} from '../schemas/document.schema'

function formatFileSize(bytes: number | null | undefined) {
  if (!bytes) return '—'
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DocumentsView() {
  const canCreate = usePermission('document', 'create')
  const canDelete = usePermission('document', 'delete')

  const { users, search, setSearch, isLoading: customersLoading } =
    useCustomers()
  const [customerId, setCustomerId] = useState<string>('')

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<DocumentCategory>('OTHER')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const storageEnabled = useStorageEnabled()
  const { uploadDocument, isUploading } = useDocumentUpload()

  const documentsQuery = useDocumentsList(customerId || undefined)
  const documentsData = documentsQuery.data as
    | {
        items: Array<{
          id: string
          title: string
          category: DocumentCategory
          fileSizeBytes: number | null
          createdAt: Date
        }>
      }
    | undefined
  const {
    createDocument,
    isCreating,
    deleteDocument,
    openDocument,
    isOpening,
  } = useDocumentMutations()

  async function handleFileUpload(file: File | undefined) {
    if (!file || !storageEnabled || !customerId) return
    if (!title.trim()) {
      toast.error('Enter a document title first')
      return
    }

    try {
      // Stores the object path, not a URL — the bucket blocks public access, so
      // every read goes through a freshly signed link.
      const objectPath = await uploadDocument(file, customerId)
      await createDocument({
        customerUserId: customerId,
        title: title.trim(),
        category,
        fileUrl: objectPath,
        fileSizeBytes: file.size,
      })
      setTitle('')
      setCategory('OTHER')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    }
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>Documents</h1>
        <p className='text-muted-foreground text-sm'>
          Upload records, protocols and consent forms for a customer.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Select customer</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-wrap gap-2'>
          <Input
            placeholder='Search customers by email…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-64'
          />
          <Select
            items={users.map((user) => ({
              value: user.id,
              label: `${user.name} · ${user.email}`,
            }))}
            value={customerId}
            onValueChange={(v) => setCustomerId(v ?? '')}
          >
            <SelectTrigger className='w-72'>
              <SelectValue placeholder={customersLoading ? 'Loading…' : 'Choose a customer'} />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} · {user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {customerId ? (
        <>
          {canCreate && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-base'>
                  <IconUpload className='size-4' /> Upload document
                </CardTitle>
              </CardHeader>
              <CardContent className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                <div className='space-y-2'>
                  <Label>Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder='Initial Skin Assessment'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Category</Label>
                  <Select
                    items={DOCUMENT_CATEGORIES.map((value) => ({
                      value,
                      label: DOCUMENT_CATEGORY_LABELS[value],
                    }))}
                    value={category}
                    onValueChange={(v) => setCategory(v as DocumentCategory)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_CATEGORIES.map((value) => (
                        <SelectItem key={value} value={value}>
                          {DOCUMENT_CATEGORY_LABELS[value]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2 sm:col-span-2 lg:col-span-2'>
                  <Label>File</Label>
                  {storageEnabled ? (
                    <>
                      <input
                        ref={fileInputRef}
                        type='file'
                        accept='application/pdf'
                        className='hidden'
                        disabled={isUploading || isCreating}
                        onChange={(e) => {
                          void handleFileUpload(e.target.files?.[0])
                          e.target.value = ''
                        }}
                      />
                      <Button
                        type='button'
                        variant='outline'
                        disabled={isUploading || isCreating || !title.trim()}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <IconUpload className='size-4' />
                        {isUploading ? 'Uploading…' : 'Choose file'}
                      </Button>
                    </>
                  ) : (
                    <p className='text-muted-foreground text-xs'>
                      Set <code>GCS_DOCUMENTS_BUCKET</code> on the API to enable uploads.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base'>
                <IconFileText className='size-4' /> Documents on file
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documentsQuery.isLoading ? (
                <div className='space-y-2'>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className='h-12 w-full' />
                  ))}
                </div>
              ) : !documentsData?.items.length ? (
                <p className='text-muted-foreground py-8 text-center text-sm'>
                  No documents for this customer yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentsData.items.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className='font-medium'>
                          {doc.title}
                        </TableCell>
                        <TableCell>
                          {DOCUMENT_CATEGORY_LABELS[doc.category]}
                        </TableCell>
                        <TableCell>{formatFileSize(doc.fileSizeBytes)}</TableCell>
                        <TableCell>
                          {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className='flex justify-end gap-1'>
                            <Button
                              size='sm'
                              variant='ghost'
                              disabled={isOpening}
                              onClick={() => void openDocument(doc.id)}
                            >
                              <IconDownload className='size-4' />
                              View
                            </Button>
                            {canDelete && (
                              <Button
                                size='sm'
                                variant='ghost'
                                onClick={() => void deleteDocument(doc.id)}
                              >
                                <IconTrash className='size-4' />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
