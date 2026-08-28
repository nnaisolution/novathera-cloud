import {
  Award,
  CalendarClock,
  CreditCard,
  FileText,
  History,
  LifeBuoy,
  Package,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AccountNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const accountNavItems: AccountNavItem[] = [
  { label: "My Orders", href: "/account/orders", icon: Package },
  {
    label: "Upcoming Appointments",
    href: "/account/appointments/upcoming",
    icon: CalendarClock,
  },
  {
    label: "Appointment History",
    href: "/account/appointments/history",
    icon: History,
  },
  { label: "Documents", href: "/account/documents", icon: FileText },
  { label: "Personal Info", href: "/account/personal-info", icon: User },
  {
    label: "Payment Methods",
    href: "/account/payment-methods",
    icon: CreditCard,
  },
  { label: "Membership", href: "/account/membership", icon: Award },
  { label: "Family Members", href: "/account/family-members", icon: Users },
  { label: "Help & Support", href: "/account/help-support", icon: LifeBuoy },
];
