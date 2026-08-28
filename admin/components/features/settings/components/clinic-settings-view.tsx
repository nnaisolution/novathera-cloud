'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSettings } from '@/components/features/settings/hooks/use-settings'
import { SettingsSection } from '@/components/features/settings/components/settings-section'
import { SETTINGS_SECTIONS } from '@/components/features/settings/utils/sections'
import type { SettingsValues } from '@/components/features/settings/types'

/** The six configuration groups. Page chrome comes from SettingsShell. */
export function ClinicSettingsView() {
  const { data, isLoading, isError, error } = useSettings()

  if (isError) {
    return (
      <Alert variant='destructive'>
        <AlertTitle>Could not load settings</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Something went wrong.'}
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading || !data) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-10 w-full max-w-2xl rounded-lg' />
        <Skeleton className='h-96 w-full rounded-xl' />
      </div>
    )
  }

  return (
    <Tabs defaultValue='business'>
      <TabsList className='flex-wrap'>
        {SETTINGS_SECTIONS.map((section) => (
          <TabsTrigger key={section.group} value={section.group}>
            {section.title}
          </TabsTrigger>
        ))}
      </TabsList>

      {SETTINGS_SECTIONS.map((section) => (
        <TabsContent key={section.group} value={section.group}>
          <SettingsSection
            section={section}
            values={(data as Record<string, SettingsValues>)[section.group] ?? {}}
          />
        </TabsContent>
      ))}
    </Tabs>
  )
}
