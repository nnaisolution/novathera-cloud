'use client'

import type { ReactElement, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { authClient, useSession } from '@/lib/auth-client'
import { writeSessionToken } from '@/lib/auth/session-token'
import { IconSettings, IconLogout } from '@tabler/icons-react'

type Props = {
  trigger: ReactNode
  defaultOpen?: boolean
  align?: 'start' | 'center' | 'end'
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

const ProfileDropdown = ({ trigger, defaultOpen, align = 'end' }: Props) => {
  const router = useRouter()
  const { data: session } = useSession()
  const name = session?.user.name ?? ''
  const email = session?.user.email ?? ''
  const image = session?.user.image ?? undefined

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          writeSessionToken(null)
          router.push('/login')
        },
      },
    })
    writeSessionToken(null)
  }

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger render={trigger as ReactElement} />
      <DropdownMenuContent className='w-80' align={align || 'end'}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className='flex items-center gap-4 px-4 py-2.5 font-normal'>
            <div className='relative'>
              <Avatar size='lg'>
                <AvatarImage src={image} alt={name} />
                <AvatarFallback>{getInitials(name)}</AvatarFallback>
              </Avatar>
              <span className='ring-card absolute right-0 bottom-0 block size-2 rounded-full bg-green-600 ring-2' />
            </div>
            <div className='flex min-w-0 flex-1 flex-col items-start'>
              <span className='text-foreground text-lg font-semibold'>{name}</span>
              <span className='text-muted-foreground w-full truncate text-base' title={email}>
                {email}
              </span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            className='gap-2 px-4 py-2.5 text-base'
            onClick={() => router.push('/settings')}
          >
            <IconSettings className='text-foreground size-5' />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant='destructive'
          className='gap-2 px-4 py-2.5 text-base'
          onClick={() => {
            void handleLogout()
          }}
        >
          <IconLogout className='size-5' />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileDropdown
