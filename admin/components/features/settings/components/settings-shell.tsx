'use client'

import {
  IconHistory,
  IconSettings,
  IconShieldLock,
  IconUserShield,
  type TablerIcon,
} from '@tabler/icons-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { usePermission } from '@/lib/auth/use-permission'
import { cn } from '@/lib/utils'

type SettingsSectionLink = {
  href: string
  title: string
  description: string
  icon: TablerIcon
  /** Permission required to see the section at all. */
  resource: string
  action: string
}

export const SETTINGS_SECTION_LINKS: SettingsSectionLink[] = [
  {
    href: '/settings',
    title: 'Clinic',
    description: 'Business, booking, commerce, notifications, security',
    icon: IconSettings,
    resource: 'setting',
    action: 'read',
  },
  {
    href: '/settings/staff',
    title: 'Staff & access',
    description: 'Accounts, roles, suspensions and sessions',
    icon: IconUserShield,
    resource: 'user',
    action: 'list',
  },
  {
    href: '/settings/roles',
    title: 'Roles',
    description: 'What each role is permitted to do',
    icon: IconShieldLock,
    resource: 'setting',
    action: 'read',
  },
  {
    href: '/settings/audit',
    title: 'Audit log',
    description: 'Security-relevant activity',
    icon: IconHistory,
    resource: 'audit',
    action: 'read',
  },
]

export function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Hooks cannot be called in a loop conditionally, so every section's
  // permission is resolved up front in a fixed order.
  const canClinic = usePermission('setting', 'read')
  const canStaff = usePermission('user', 'list')
  const canAudit = usePermission('audit', 'read')

  const allowed: Record<string, boolean> = {
    '/settings': canClinic,
    '/settings/staff': canStaff,
    '/settings/roles': canClinic,
    '/settings/audit': canAudit,
  }

  const visible = SETTINGS_SECTION_LINKS.filter((link) => allowed[link.href])

  const active =
    SETTINGS_SECTION_LINKS.find((link) =>
      link.href === '/settings'
        ? pathname === '/settings'
        : pathname.startsWith(link.href),
    ) ?? SETTINGS_SECTION_LINKS[0]

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>Settings</h1>
        <p className='text-muted-foreground text-sm'>{active.description}</p>
      </div>

      {visible.length === 0 ? (
        <Alert>
          <AlertTitle>No access</AlertTitle>
          <AlertDescription>
            Your role does not have access to any settings section.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <nav className='bg-muted/60 inline-flex w-fit max-w-full flex-wrap gap-1 rounded-lg p-1'>
            {visible.map((link) => {
              // `/settings` is a prefix of every other section, so it only
              // counts as active on an exact match.
              const active =
                link.href === '/settings'
                  ? pathname === '/settings'
                  : pathname.startsWith(link.href)

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <link.icon className='size-4' />
                  {link.title}
                </Link>
              )
            })}
          </nav>

          <div className='animate-in fade-in duration-300'>{children}</div>
        </>
      )}
    </div>
  )
}
