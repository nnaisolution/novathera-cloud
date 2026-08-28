export const ASSIGNABLE_ROLES = [
  'admin',
  'manager',
  'staff',
  'receptionist',
] as const

export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number]

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  manager: 'Manager',
  staff: 'Staff',
  receptionist: 'Receptionist',
  customer: 'Customer',
}

/** Rough one-liners shown alongside the permission matrix. */
export const ROLE_SUMMARIES: Record<string, string> = {
  admin: 'Full access, including settings, staff accounts and the audit log.',
  manager: 'Runs the clinic day to day. Sees revenue, cannot manage accounts.',
  staff: 'Reads their work queues and closes out appointments.',
  receptionist: 'Front desk. Reads schedules only.',
  customer: 'No admin access.',
}

export function isAssignableRole(role: string | null): role is AssignableRole {
  return ASSIGNABLE_ROLES.includes(role as AssignableRole)
}
