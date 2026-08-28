const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export type BookingDateOption = {
  value: string;
  dayLabel: string;
  dayNumber: string;
};

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function calendarKeyInZone(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * Ten clinic-local days starting today. The key is a calendar date, not an
 * instant — slots and `myCreate` interpret it in `location.timezone`.
 */
export function getBookingDateOptions(timeZone: string, count = 10, now = new Date()): BookingDateOption[] {
  const todayKey = calendarKeyInZone(now, timeZone);
  const [yearRaw, monthRaw, dayRaw] = todayKey.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return [];

  return Array.from({ length: count }, (_, index) => {
    const utc = new Date(Date.UTC(year, month - 1, day + index));
    const y = utc.getUTCFullYear();
    const m = utc.getUTCMonth() + 1;
    const d = utc.getUTCDate();
    return {
      value: `${y}-${pad2(m)}-${pad2(d)}`,
      dayLabel: DAY_LABELS[utc.getUTCDay()] ?? "",
      dayNumber: pad2(d),
    };
  });
}
