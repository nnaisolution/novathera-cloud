import {
  IconBuildingStore,
  IconCalendarEvent,
  IconChartAreaLine,
  IconCreditCard,
  IconDiscount,
  IconFileText,
  IconHeartbeat,
  IconMapPin,
  IconPackage,
  IconReceipt,
  IconTool,
  IconTruck,
  IconUserCircle,
  IconUsers,
} from '@tabler/icons-react'
import type { TablerIcon } from '@tabler/icons-react'

export type StaffRole = 'admin' | 'manager' | 'staff' | 'receptionist'

export type NavItem = {
  title: string
  href: string
  icon: TablerIcon
  /** When set, only these roles see the item. Receptionist is excluded from health. */
  roles?: readonly StaffRole[]
}

export const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/', icon: IconChartAreaLine },
  { title: 'Customers', href: '/customers', icon: IconUsers },
  { title: 'Employees', href: '/employees', icon: IconUserCircle },
  { title: 'Services', href: '/services', icon: IconTool },
  { title: 'Locations', href: '/locations', icon: IconMapPin },
  { title: 'Bookings', href: '/bookings', icon: IconCalendarEvent },
  {
    title: 'Health Data',
    href: '/health',
    icon: IconHeartbeat,
    roles: ['admin', 'manager', 'staff'],
  },
  { title: 'Payments', href: '/payments', icon: IconCreditCard },
  { title: 'Brands', href: '/brands', icon: IconBuildingStore },
  { title: 'Products', href: '/products', icon: IconPackage },
  { title: 'Orders', href: '/orders', icon: IconReceipt },
  { title: 'Discounts', href: '/discounts', icon: IconDiscount },
  { title: 'Shipping', href: '/shipping', icon: IconTruck },
  { title: 'Documents', href: '/documents', icon: IconFileText },
]
