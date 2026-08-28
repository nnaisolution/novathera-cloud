'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import type { HealthListResponse, HealthObservationType } from '../types'

export function useHealthObservations() {
  const [type, setType] = useState<HealthObservationType | undefined>()
  const [search, setSearch] = useState('')

  const query = useQuery({
    queryKey: ['patient-health', type, search],
    queryFn: async (): Promise<HealthListResponse> => {
      const params = new URLSearchParams()
      params.set('limit', '50')
      if (type) params.set('type', type)
      if (search.trim()) params.set('search', search.trim())
      const response = await fetch(`/api/patient-health?${params.toString()}`, {
        credentials: 'include',
      })
      const payload = (await response.json()) as HealthListResponse
      if (!response.ok) {
        throw new Error(payload.error ?? 'Could not load health observations')
      }
      return payload
    },
  })

  return {
    ...query,
    type,
    setType,
    search,
    setSearch,
  }
}
