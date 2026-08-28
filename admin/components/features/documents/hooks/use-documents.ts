'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTRPC } from '@/lib/trpc/client'
import { getTrpcErrorMessage } from '@/lib/trpc/error-message'
import type { DocumentCategory } from '../schemas/document.schema'

export function useDocumentsList(customerUserId: string | undefined) {
  const trpc = useTRPC()

  return useQuery({
    ...trpc.documents.list.queryOptions({
      page: 1,
      limit: 50,
      sortOrder: 'desc',
      customerUserId,
    }),
    enabled: Boolean(customerUserId),
  })
}

export function useDocumentMutations() {
  const trpc = useTRPC()
  const qc = useQueryClient()

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: trpc.documents.list.queryKey() })
  }

  const createMutation = useMutation(
    trpc.documents.create.mutationOptions({
      onSuccess: () => {
        toast.success('Document added')
        invalidate()
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  const deleteMutation = useMutation(
    trpc.documents.delete.mutationOptions({
      onSuccess: () => {
        toast.success('Document removed')
        invalidate()
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  // Documents live in a private bucket, so viewing one means asking the API
  // for a fresh short-lived link rather than storing a permanent URL.
  const downloadMutation = useMutation(
    trpc.documents.downloadUrl.mutationOptions({
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const call = (mutation: any, input: unknown) =>
    mutation.mutateAsync(input) as Promise<unknown>

  return {
    createDocument: (input: {
      customerUserId: string
      title: string
      category: DocumentCategory
      fileUrl: string
      fileSizeBytes?: number
    }) => call(createMutation, input),
    isCreating: createMutation.isPending,
    deleteDocument: (id: string) => call(deleteMutation, { id }),
    isDeleting: deleteMutation.isPending,
    openDocument: async (id: string) => {
      const result = (await call(downloadMutation, { id })) as { url?: string }
      if (result?.url) {
        window.open(result.url, '_blank', 'noopener,noreferrer')
      }
    },
    isOpening: downloadMutation.isPending,
  }
}
