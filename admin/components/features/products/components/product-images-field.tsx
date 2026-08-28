'use client'

import { useRef, useState } from 'react'
import { IconPlus, IconTrash, IconUpload } from '@tabler/icons-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useProductImageUpload,
  useStorageEnabled,
} from '@/lib/hooks/use-storage-upload'
import type { ProductImageValue } from '../schemas/product.schema'

type ProductImagesFieldProps = {
  images: ProductImageValue[]
  onChange: (images: ProductImageValue[]) => void
}

export function ProductImagesField({
  images,
  onChange,
}: ProductImagesFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const storageEnabled = useStorageEnabled()
  const { uploadImage, isUploading } = useProductImageUpload()
  const [pasteUrl, setPasteUrl] = useState('')
  const [pasteAlt, setPasteAlt] = useState('')

  const addImage = (url: string, alt?: string) => {
    onChange([
      ...images,
      { url, alt: alt ?? '', sortOrder: images.length },
    ])
  }

  const handlePasteAdd = () => {
    const url = pasteUrl.trim()
    if (!url) return
    try {
      new URL(url)
    } catch {
      toast.error('Enter a valid image URL')
      return
    }
    addImage(url, pasteAlt.trim())
    setPasteUrl('')
    setPasteAlt('')
  }

  const handleFileUpload = async (file: File | undefined) => {
    if (!file || !storageEnabled) return
    try {
      const url = await uploadImage(file)
      addImage(url, file.name)
      toast.success('Image uploaded')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    }
  }

  return (
    <div className='space-y-3'>
      <Label>Images</Label>

      {images.length > 0 && (
        <div className='space-y-2'>
          {images.map((img, index) => (
            <div
              key={`${img.url}-${index}`}
              className='flex items-center gap-2 rounded border p-2'
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt || 'Product'}
                className='size-12 rounded object-cover'
              />
              <div className='min-w-0 flex-1 space-y-1'>
                <Input
                  value={img.url}
                  onChange={(e) =>
                    onChange(
                      images.map((item, i) =>
                        i === index ? { ...item, url: e.target.value } : item,
                      ),
                    )
                  }
                  className='font-mono text-xs'
                />
                <Input
                  placeholder='Alt text'
                  value={img.alt ?? ''}
                  onChange={(e) =>
                    onChange(
                      images.map((item, i) =>
                        i === index ? { ...item, alt: e.target.value } : item,
                      ),
                    )
                  }
                />
              </div>
              <Button
                type='button'
                size='icon'
                variant='ghost'
                onClick={() =>
                  onChange(
                    images
                      .filter((_, i) => i !== index)
                      .map((item, i) => ({ ...item, sortOrder: i })),
                  )
                }
              >
                <IconTrash className='size-4' />
              </Button>
            </div>
          ))}
        </div>
      )}

      {storageEnabled ? (
        <div className='flex flex-wrap items-center gap-2'>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/jpeg,image/png,image/webp,image/gif'
            className='hidden'
            disabled={isUploading}
            onChange={(e) => {
              void handleFileUpload(e.target.files?.[0])
              e.target.value = ''
            }}
          />
          <Button
            type='button'
            variant='outline'
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <IconUpload className='size-4' />
            {isUploading ? 'Uploading…' : 'Upload image'}
          </Button>
          <span className='text-muted-foreground text-xs'>
            or paste a URL below
          </span>
        </div>
      ) : (
        <p className='text-muted-foreground text-xs'>
          Set <code>GCS_PRODUCT_IMAGES_BUCKET</code> on the API to enable
          uploads. Paste image URLs for now.
        </p>
      )}

      <div className='flex flex-wrap gap-2'>
        <Input
          placeholder='https://… image URL'
          value={pasteUrl}
          onChange={(e) => setPasteUrl(e.target.value)}
          className='min-w-56 flex-1'
        />
        <Input
          placeholder='Alt text'
          value={pasteAlt}
          onChange={(e) => setPasteAlt(e.target.value)}
          className='w-40'
        />
        <Button type='button' variant='outline' onClick={handlePasteAdd}>
          <IconPlus className='size-4' /> Add URL
        </Button>
      </div>
    </div>
  )
}
