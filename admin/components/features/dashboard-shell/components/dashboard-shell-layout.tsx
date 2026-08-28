'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

import ProfileDropdown from '@/components/shadcn-studio/blocks/dropdown-profile'

import FacebookIcon from '@/assets/svg/facebook-icon'
import InstagramIcon from '@/assets/svg/instagram-icon'
import LinkedinIcon from '@/assets/svg/linkedin-icon'
import TwitterIcon from '@/assets/svg/twitter-icon'

import { navItems } from '../nav-items'
import { AppSidebar } from './app-sidebar'

type DashboardShellLayoutProps = {
  children: React.ReactNode
}

// Settings lives behind the avatar menu rather than the sidebar, so its
// pages are not in navItems and need their own breadcrumb labels.
const SETTINGS_TITLES: Record<string, string> = {
  '/settings/staff': 'Settings · Staff & access',
  '/settings/roles': 'Settings · Roles',
  '/settings/audit': 'Settings · Audit log',
  '/settings': 'Settings',
}

function getPageTitle(pathname: string) {
  const settingsTitle = Object.keys(SETTINGS_TITLES)
    .sort((a, b) => b.length - a.length)
    .find((href) => pathname.startsWith(href))
  if (settingsTitle) return SETTINGS_TITLES[settingsTitle]

  const item = navItems.find((navItem) =>
    navItem.href === '/' ? pathname === '/' : pathname.startsWith(navItem.href),
  )
  return item?.title ?? 'Dashboard'
}

export function DashboardShellLayout({ children }: DashboardShellLayoutProps) {
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)

  return (
    <div className='flex min-h-dvh w-full'>
      <SidebarProvider>
        <AppSidebar />
        <div className='flex flex-1 flex-col'>
          <header className='bg-card sticky top-0 z-50 border-b'>
            <div className='mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-2 sm:px-6'>
              <div className='flex items-center gap-4'>
                <SidebarTrigger className='[&_svg]:size-5!' />
                <Separator
                  orientation='vertical'
                  className='hidden h-4! data-vertical:self-center sm:block'
                />
                <Breadcrumb className='hidden sm:block'>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink render={<Link href='/' />}>Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className='flex items-center gap-1.5'>
                <ProfileDropdown
                  trigger={
                    <Button variant='ghost' size='icon-lg'>
                      <Avatar className='size-[inherit] rounded-[inherit] after:rounded-[inherit]'>
                        <AvatarImage
                          src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png'
                          className='rounded-[inherit]'
                        />
                        <AvatarFallback className='rounded-[inherit]'>JD</AvatarFallback>
                      </Avatar>
                    </Button>
                  }
                />
              </div>
            </div>
          </header>
          <main className='mx-auto size-full max-w-7xl flex-1 px-4 py-6 sm:px-6'>{children}</main>
          <footer>
            <div className='text-muted-foreground mx-auto flex size-full max-w-7xl items-center justify-between gap-3 px-4 py-3 max-sm:flex-col sm:gap-6 sm:px-6'>
              <p className='text-sm text-balance max-sm:text-center'>
                {`©${new Date().getFullYear()}`}{' '}
                <span className='text-primary font-medium'>Nova Thera</span>
              </p>
              <div className='text-muted-foreground *:hover:text-primary flex items-center gap-5'>
                <a href='#'>
                  <FacebookIcon className='size-4' />
                </a>
                <a href='#'>
                  <InstagramIcon className='size-4' />
                </a>
                <a href='#'>
                  <LinkedinIcon className='size-4' />
                </a>
                <a href='#'>
                  <TwitterIcon className='size-4' />
                </a>
              </div>
            </div>
          </footer>
        </div>
      </SidebarProvider>
    </div>
  )
}
