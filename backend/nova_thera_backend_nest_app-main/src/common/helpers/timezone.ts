/**
 * Timezone helpers for reporting.
 *
 * Rows are stored as UTC instants, but an owner reading a dashboard thinks in
 * clinic-local days — a booking at 18:00 Edmonton time on the 3rd must not land
 * in the 4th's bucket. Everything here converts using the IANA zone rather than
 * the server's own offset, which is not guaranteed to be Alberta's.
 */

/** Default reporting zone — matches `Location.timezone`'s schema default. */
export const DEFAULT_REPORTING_TIMEZONE = 'America/Edmonton';

/** `YYYY-MM-DD` for the calendar day the instant falls on, in `timeZone`. */
export function zonedDayKey(date: Date, timeZone: string): string {
  // en-CA formats as YYYY-MM-DD, which is also our sort order.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Milliseconds `timeZone` is ahead of UTC at the given instant. */
function zoneOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);

  const field: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== 'literal') field[part.type] = Number(part.value);
  }

  const asUtc = Date.UTC(
    field.year,
    field.month - 1,
    field.day,
    // Intl can emit hour 24 for midnight under hour12: false.
    field.hour % 24,
    field.minute,
    field.second,
  );

  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** The UTC instant at which the given day starts in `timeZone`. */
export function startOfZonedDay(date: Date, timeZone: string): Date {
  const [year, month, day] = zonedDayKey(date, timeZone).split('-').map(Number);
  const midnightAsUtc = Date.UTC(year, month - 1, day);
  // Offset is evaluated at the candidate instant; a single pass is correct
  // except within the DST transition hour itself, which no clinic books into.
  const offset = zoneOffsetMs(new Date(midnightAsUtc), timeZone);
  return new Date(midnightAsUtc - offset);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

/** Ordered `YYYY-MM-DD` keys covering `from`..`to` inclusive, in `timeZone`. */
export function zonedDayKeysBetween(
  from: Date,
  to: Date,
  timeZone: string,
): string[] {
  const keys: string[] = [];
  let cursor = startOfZonedDay(from, timeZone);
  const last = zonedDayKey(to, timeZone);

  // Step by 25h then re-normalise so DST days can't stall or skip the cursor.
  for (let guard = 0; guard < 400; guard++) {
    const key = zonedDayKey(cursor, timeZone);
    keys.push(key);
    if (key >= last) break;
    cursor = startOfZonedDay(addDays(cursor, 1.05), timeZone);
  }

  return keys;
}
