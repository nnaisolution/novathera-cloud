const CURRENCY = 'CAD'

const currencyFormatter = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 0,
})

const preciseCurrencyFormatter = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const compactCurrencyFormatter = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: CURRENCY,
  notation: 'compact',
  maximumFractionDigits: 1,
})

const numberFormatter = new Intl.NumberFormat('en-CA')

/** Whole dollars — the default for headline figures. */
export function formatMoney(cents: number) {
  return currencyFormatter.format(cents / 100)
}

/** Dollars and cents, for line items where precision matters. */
export function formatMoneyPrecise(cents: number) {
  return preciseCurrencyFormatter.format(cents / 100)
}

/** `$12.4K` — for axis ticks and other tight spaces. */
export function formatMoneyCompact(cents: number) {
  return compactCurrencyFormatter.format(cents / 100)
}

export function formatNumber(value: number) {
  return numberFormatter.format(value)
}

export function formatPercent(value: number, fractionDigits = 1) {
  return `${value.toFixed(fractionDigits)}%`
}

export type ChangeTone = 'up' | 'down' | 'flat' | 'unknown'

/**
 * A null changePct means there was no activity in the previous period, which
 * is not the same as 0% — showing "+0%" there would be a lie.
 */
export function describeChange(
  changePct: number | null,
  options: { invert?: boolean } = {},
): { label: string; tone: ChangeTone } {
  if (changePct === null) return { label: 'No prior data', tone: 'unknown' }

  const rounded = Math.round(changePct * 10) / 10
  if (Math.abs(rounded) < 0.05) return { label: 'No change', tone: 'flat' }

  const rising = rounded > 0
  // For metrics like no-shows, rising is the bad direction.
  const good = options.invert ? !rising : rising

  return {
    label: `${rising ? '+' : ''}${rounded.toFixed(1)}%`,
    tone: good ? 'up' : 'down',
  }
}

export function formatDayLabel(isoDay: string) {
  // Parse as UTC so the label matches the server's bucketing exactly.
  const date = new Date(`${isoDay}T00:00:00Z`)
  return date.toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export function formatTime(date: Date, timeZone: string) {
  return date.toLocaleTimeString('en-CA', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  })
}

export function formatDate(date: Date, timeZone?: string) {
  return date.toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...(timeZone ? { timeZone } : {}),
  })
}

/** Whole days from now until `date`; negative once it is in the past. */
export function daysUntil(date: Date) {
  const ms = date.getTime() - Date.now()
  return Math.round(ms / (24 * 60 * 60 * 1000))
}
