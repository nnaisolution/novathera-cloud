export function localDateTimeToUtc(
  calendarDay: Date,
  hhmm: string,
  timeZone: string,
): Date {
  const dateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(calendarDay)

  const [hour, minute] = hhmm.split(':').map(Number)
  let ms = Date.UTC(
    Number(dateStr.slice(0, 4)),
    Number(dateStr.slice(5, 7)) - 1,
    Number(dateStr.slice(8, 10)),
    hour,
    minute,
  )

  for (let attempt = 0; attempt < 6; attempt++) {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    const parts = fmt.formatToParts(new Date(ms))
    const actualHour = Number(parts.find((p) => p.type === 'hour')!.value)
    const actualMinute = Number(parts.find((p) => p.type === 'minute')!.value)
    const actualDay = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(ms))
    const targetMinutes = hour * 60 + minute
    const actualMinutes = actualHour * 60 + actualMinute

    if (actualDay === dateStr && actualMinutes === targetMinutes) {
      break
    }

    ms += (targetMinutes - actualMinutes) * 60_000
    if (actualDay < dateStr) ms += 24 * 60 * 60_000
    if (actualDay > dateStr) ms -= 24 * 60 * 60_000
  }

  return new Date(ms)
}
