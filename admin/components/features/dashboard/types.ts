export const DATE_PRESETS = ['30d', '60d', '90d', 'custom'] as const

export type DatePreset = (typeof DATE_PRESETS)[number]

export type DateRange = {
  preset: DatePreset
  from?: Date
  to?: Date
}

export const PRESET_LABELS: Record<DatePreset, string> = {
  '30d': 'Last 30 days',
  '60d': 'Last 60 days',
  '90d': 'Last 90 days',
  custom: 'Custom',
}
