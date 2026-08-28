import { TRPCError } from '@trpc/server';

export const SLOT_STEP_MINUTES = 30;

export function localParts(date: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const weekday = parts.find((p) => p.type === 'weekday')!.value.toLowerCase();
  const hour = Number(parts.find((p) => p.type === 'hour')!.value);
  const minute = Number(parts.find((p) => p.type === 'minute')!.value);
  return { weekday, minutes: hour * 60 + minute };
}

export function hhmmToMinutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new TRPCError({ code: 'BAD_REQUEST', message });
}

export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

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
  }).format(calendarDay);

  const [hour, minute] = hhmm.split(':').map(Number);
  let ms = Date.UTC(
    Number(dateStr.slice(0, 4)),
    Number(dateStr.slice(5, 7)) - 1,
    Number(dateStr.slice(8, 10)),
    hour,
    minute,
  );

  for (let attempt = 0; attempt < 6; attempt++) {
    const parts = localParts(new Date(ms), timeZone);
    const actualDay = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(ms));
    const targetMinutes = hour * 60 + minute;

    if (actualDay === dateStr && parts.minutes === targetMinutes) {
      break;
    }

    ms += (targetMinutes - parts.minutes) * 60_000;
    if (actualDay < dateStr) ms += 24 * 60 * 60_000;
    if (actualDay > dateStr) ms -= 24 * 60 * 60_000;
  }

  return new Date(ms);
}

export function localDayBounds(calendarDay: Date, timeZone: string) {
  const dayStart = localDateTimeToUtc(calendarDay, '00:00', timeZone);
  const nextDay = new Date(calendarDay);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  const dayEnd = localDateTimeToUtc(nextDay, '00:00', timeZone);
  return { dayStart, dayEnd };
}

export type ScheduleDay = {
  day: string;
  isWorking: boolean;
  startTime: string;
  endTime: string;
};

export type OperatingDay = {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

export function parseSchedule(schedule: unknown): ScheduleDay[] {
  return schedule as ScheduleDay[];
}

export function parseOperatingHours(hours: unknown): OperatingDay[] {
  return hours as OperatingDay[];
}
