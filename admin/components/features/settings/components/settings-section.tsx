'use client'

import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useUpdateSettings } from '@/components/features/settings/hooks/use-settings'
import { SettingsField } from '@/components/features/settings/components/settings-field'
import type {
  SectionDef,
  SettingsValues,
} from '@/components/features/settings/types'

/** Field-level messages returned by the backend's Zod error formatter. */
type FieldErrors = Record<string, string[] | undefined>

export function SettingsSection({
  section,
  values,
}: {
  section: SectionDef
  values: SettingsValues
}) {
  const [draft, setDraft] = useState<SettingsValues>(values)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const update = useUpdateSettings()

  // Re-sync when the server sends fresh values (initial load, or after save).
  useEffect(() => {
    setDraft(values)
  }, [values])

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(values),
    [draft, values],
  )

  const saving = update.isPending

  function setField(name: string, value: unknown) {
    setDraft((current) => ({ ...current, [name]: value }))
    setFieldErrors((current) => ({ ...current, [name]: undefined }))
  }

  function handleSave() {
    setFieldErrors({})
    update.mutate(
      // The discriminated union is validated server-side; the cast is needed
      // because the section table is generic over all groups.
      { group: section.group, values: draft } as never,
      {
        onError: (error) => {
          const zodError = (
            error as unknown as {
              data?: { zodError?: { fieldErrors?: FieldErrors } | null }
            }
          ).data?.zodError
          if (zodError?.fieldErrors) setFieldErrors(zodError.fieldErrors)
        },
      },
    )
  }

  return (
    <Card className='ring-foreground/10 animate-in fade-in slide-in-from-bottom-2 shadow-none ring-1 duration-500 ease-out fill-mode-backwards'>
      <CardHeader>
        <CardTitle>{section.title}</CardTitle>
        <CardDescription>{section.description}</CardDescription>
      </CardHeader>

      <CardContent className='space-y-5'>
        {section.notice ? (
          <div className='flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm'>
            <IconAlertTriangle className='mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400' />
            <p className='text-muted-foreground'>{section.notice}</p>
          </div>
        ) : null}

        <div className='grid gap-5 sm:grid-cols-2'>
          {section.fields.map((field) => (
            <div
              key={field.name}
              className={field.type === 'switch' ? 'sm:col-span-2' : undefined}
            >
              <SettingsField
                field={field}
                value={draft[field.name]}
                error={fieldErrors[field.name]?.[0]}
                disabled={saving || !update.canUpdate}
                onChange={(value) => setField(field.name, value)}
              />
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className='flex items-center justify-between gap-3'>
        <p className='text-muted-foreground text-xs'>
          {!update.canUpdate
            ? 'Your role can view these but not change them.'
            : dirty
              ? 'Unsaved changes'
              : 'All changes saved'}
        </p>
        <div className='flex gap-2'>
          <Button
            variant='ghost'
            size='sm'
            disabled={!dirty || saving}
            onClick={() => {
              setDraft(values)
              setFieldErrors({})
            }}
          >
            Reset
          </Button>
          <Button
            size='sm'
            disabled={!dirty || saving || !update.canUpdate}
            onClick={handleSave}
          >
            {saving ? (
              <>
                <IconLoader2 className='size-4 animate-spin' />
                Saving
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
