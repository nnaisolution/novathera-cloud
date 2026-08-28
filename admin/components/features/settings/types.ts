export type SettingsGroup =
  | 'business'
  | 'booking'
  | 'commerce'
  | 'notifications'
  | 'security'
  | 'dashboard'

export type FieldDef =
  | {
      type: 'text' | 'email'
      name: string
      label: string
      hint?: string
      placeholder?: string
    }
  | {
      type: 'number'
      name: string
      label: string
      hint?: string
      min?: number
      max?: number
      step?: number
      suffix?: string
    }
  /** Stored as integer cents, edited in dollars. */
  | { type: 'money'; name: string; label: string; hint?: string }
  | {
      type: 'select'
      name: string
      label: string
      hint?: string
      options: { value: string; label: string }[]
    }
  | { type: 'switch'; name: string; label: string; hint?: string }
  /** Comma-separated list of email addresses. */
  | { type: 'emails'; name: string; label: string; hint?: string }

export type SectionDef = {
  group: SettingsGroup
  title: string
  description: string
  /** Shown as a warning banner above the fields. */
  notice?: string
  fields: FieldDef[]
}

export type SettingsValues = Record<string, unknown>
