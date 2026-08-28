'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/lib/trpc/client'

type SignedUpload = {
  uploadUrl: string
  objectPath: string
  publicUrl: string | null
}

/**
 * Uploads a file straight from the browser to Google Cloud Storage.
 *
 * The backend mints a short-lived signed URL after checking the caller's
 * permission; the bytes then go directly to GCS, so file content never passes
 * through the API. The signature is bound to the content type, which is why the
 * PUT must send exactly the same one.
 */
async function putToSignedUrl(
  signed: SignedUpload,
  file: File,
): Promise<void> {
  const response = await fetch(signed.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })

  if (!response.ok) {
    throw new Error(
      `Upload rejected by storage (${response.status}). The link may have expired — try again.`,
    )
  }
}

/** Whether Cloud Storage is configured, so the UI can explain itself. */
export function useStorageEnabled() {
  const trpc = useTRPC()
  const { data } = useQuery(trpc.storage.status.queryOptions())
  return Boolean((data as { enabled?: boolean } | undefined)?.enabled)
}

export function useProductImageUpload() {
  const trpc = useTRPC()
  const sign = useMutation(
    trpc.storage.createProductImageUploadUrl.mutationOptions(),
  )

  return {
    /** Returns the public URL to store on the product. */
    uploadImage: async (file: File): Promise<string> => {
      const signed = (await sign.mutateAsync({
        filename: file.name,
        contentType: file.type,
        sizeBytes: file.size,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)) as SignedUpload

      await putToSignedUrl(signed, file)

      if (!signed.publicUrl) {
        throw new Error('Storage did not return a public URL')
      }
      return signed.publicUrl
    },
    isUploading: sign.isPending,
  }
}

export function useDocumentUpload() {
  const trpc = useTRPC()
  const sign = useMutation(
    trpc.storage.createDocumentUploadUrl.mutationOptions(),
  )

  return {
    /**
     * Returns the object path, not a URL. The documents bucket blocks public
     * access, so reads always go through a freshly signed link.
     */
    uploadDocument: async (
      file: File,
      customerUserId: string,
    ): Promise<string> => {
      const signed = (await sign.mutateAsync({
        customerUserId,
        filename: file.name,
        contentType: file.type,
        sizeBytes: file.size,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)) as SignedUpload

      await putToSignedUrl(signed, file)
      return signed.objectPath
    },
    isUploading: sign.isPending,
  }
}
