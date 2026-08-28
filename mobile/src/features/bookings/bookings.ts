import type { inferRouterOutputs } from "@trpc/server";

import type { NestAppRouter } from "../../api/nest-client";
import type { ChipTone } from "../../components/Chip";

type NestOutputs = inferRouterOutputs<NestAppRouter>;

export type BookingPage = NestOutputs["bookings"]["myList"];
export type Booking = BookingPage["items"][number];

type BookingStatus = Booking["status"];
type PaymentStatus = Booking["paymentStatus"];

export type BookingChip = { label: string; tone: ChipTone };

const STATUS_CHIPS: Record<BookingStatus, BookingChip> = {
  CONFIRMED: { label: "Confirmed", tone: "positive" },
  COMPLETED: { label: "Completed", tone: "neutral" },
  CANCELLED: { label: "Cancelled", tone: "critical" },
  NO_SHOW: { label: "Missed", tone: "critical" },
};

/**
 * `NONE` means the visit was never priced for online payment, which is not
 * something to tell the patient about, so it produces no chip.
 */
const PAYMENT_CHIPS: Record<PaymentStatus, BookingChip | null> = {
  NONE: null,
  PENDING: { label: "Payment due", tone: "attention" },
  PAID: { label: "Paid", tone: "positive" },
  REFUNDED: { label: "Refunded", tone: "neutral" },
};

export function statusChip(booking: Booking): BookingChip {
  return STATUS_CHIPS[booking.status];
}

export function paymentChip(booking: Booking): BookingChip | null {
  return PAYMENT_CHIPS[booking.paymentStatus];
}

export function practitionerName(booking: Booking): string {
  return `${booking.employee.firstName} ${booking.employee.lastName}`.trim();
}

/** Only a confirmed visit that has not started yet can still be cancelled. */
export function isCancellable(booking: Booking, now: Date): boolean {
  return booking.status === "CONFIRMED" && booking.startTime.getTime() > now.getTime();
}

export function isPaymentDue(booking: Booking): boolean {
  return booking.status === "CONFIRMED" && booking.paymentStatus === "PENDING";
}

// ---------------------------------------------------------------------------
// Time
//
// A booking's `startTime` is an instant, but the appointment happens in the
// clinic's `location.timezone`. Formatting it in the device zone would show a
// patient who is travelling — or whose phone is simply set elsewhere — an hour
// they must not act on, so every rendered time is pinned to the clinic zone and
// labelled with it.
// ---------------------------------------------------------------------------

export type BookingWhen = {
  dayNumber: string;
  monthShort: string;
  weekdayShort: string;
  timeLabel: string;
  /** Short zone name for the clinic, e.g. "EST". Empty if the runtime omits it. */
  zoneLabel: string;
  dateLabel: string;
  /**
   * True when the clinic zone could not be applied and the device's own zone
   * was used instead. The UI has to say so; a wrong hour under a right label
   * is the one outcome worse than an ugly caveat.
   */
  usedDeviceZone: boolean;
};

const PART_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
};

const UNKNOWN_WHEN: BookingWhen = {
  dayNumber: "--",
  monthShort: "",
  weekdayShort: "",
  timeLabel: "Time unavailable",
  zoneLabel: "",
  dateLabel: "Date unavailable",
  usedDeviceZone: false,
};

// Building an Intl.DateTimeFormat is expensive enough to matter in a list, and
// a clinic timezone repeats across every row.
const zonedFormatters = new Map<string, Intl.DateTimeFormat | null>();
let deviceFormatter: Intl.DateTimeFormat | null = null;

function zonedFormatter(timeZone: string): Intl.DateTimeFormat | null {
  const cached = zonedFormatters.get(timeZone);
  if (cached !== undefined) return cached;

  let formatter: Intl.DateTimeFormat | null = null;
  try {
    const candidate = new Intl.DateTimeFormat(undefined, { ...PART_OPTIONS, timeZone });
    // A runtime built without full ICU data can accept `timeZone` and then
    // quietly ignore it, which would print the device's clock. Confirming the
    // resolved zone is the only way to catch that.
    const resolved = candidate.resolvedOptions().timeZone;
    formatter = resolved.toLowerCase() === timeZone.toLowerCase() ? candidate : null;
  } catch {
    formatter = null;
  }

  zonedFormatters.set(timeZone, formatter);
  return formatter;
}

function deviceZoneFormatter(): Intl.DateTimeFormat {
  deviceFormatter ??= new Intl.DateTimeFormat(undefined, PART_OPTIONS);
  return deviceFormatter;
}

export function formatBookingWhen(startTime: Date, timeZone: string): BookingWhen {
  if (Number.isNaN(startTime.getTime())) return UNKNOWN_WHEN;

  const zoned = zonedFormatter(timeZone);
  const parts = (zoned ?? deviceZoneFormatter()).formatToParts(startTime);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((candidate) => candidate.type === type)?.value ?? "";

  const hour = part("hour");
  const minute = part("minute");
  const dayPeriod = part("dayPeriod");
  const weekday = part("weekday");
  const day = part("day");
  const month = part("month");
  const year = part("year");

  return {
    dayNumber: day,
    monthShort: month.toUpperCase(),
    weekdayShort: weekday,
    timeLabel: hour && minute ? `${hour}:${minute}${dayPeriod ? ` ${dayPeriod}` : ""}` : "",
    zoneLabel: part("timeZoneName"),
    dateLabel: [weekday, day, month, year].filter(Boolean).join(" "),
    usedDeviceZone: zoned === null,
  };
}

export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return "";
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  const hourLabel = hours === 1 ? "1 hr" : `${hours} hrs`;
  return remainder === 0 ? hourLabel : `${hourLabel} ${remainder} min`;
}

export type PublicLocation = NestOutputs["locations"]["publicList"][number];
export type PublicCategory = NestOutputs["serviceCategories"]["publicList"][number];
export type PublicService = NestOutputs["services"]["publicList"][number];
export type PublicStaffMember = NestOutputs["bookings"]["publicStaff"][number];
export type PublicSlot = NestOutputs["bookings"]["publicAvailableSlots"][number];
export type CreatedBooking = NestOutputs["bookings"]["myCreate"];

export function formatLocationAddress(location: PublicLocation): string {
  const street = [location.addressLine1, location.addressLine2].filter(Boolean).join(", ");
  return [street, location.city, location.province].filter(Boolean).join(", ");
}

export function staffDisplayName(member: Pick<PublicStaffMember, "firstName" | "lastName">): string {
  return `${member.firstName} ${member.lastName}`.trim();
}

/** Slot times from `publicAvailableSlots` are `HH:mm` in the clinic zone. */
export function formatSlotTime(hhmm: string): string {
  const [hourRaw, minuteRaw] = hhmm.split(":");
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return hhmm;

  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

/**
 * Convert a clinic-local calendar day + `HH:mm` into a UTC `Date`.
 *
 * Matches the storefront and Nest availability helper: the day is read back
 * through `Intl` in `timeZone` so the booking lands on the hour the patient
 * tapped, not the device's clock.
 */
export function localDateTimeToUtc(calendarDay: Date, hhmm: string, timeZone: string): Date {
  const dateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(calendarDay);

  const [hourRaw, minuteRaw] = hhmm.split(":");
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return new Date(NaN);

  let ms = Date.UTC(
    Number(dateStr.slice(0, 4)),
    Number(dateStr.slice(5, 7)) - 1,
    Number(dateStr.slice(8, 10)),
    hour,
    minute,
  );

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date(ms));
    const actualHour = Number(parts.find((part) => part.type === "hour")?.value);
    const actualMinute = Number(parts.find((part) => part.type === "minute")?.value);
    const actualDay = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(ms));
    const targetMinutes = hour * 60 + minute;
    const actualMinutes = actualHour * 60 + actualMinute;

    if (actualDay === dateStr && actualMinutes === targetMinutes) break;

    ms += (targetMinutes - actualMinutes) * 60_000;
    if (actualDay < dateStr) ms += 24 * 60 * 60_000;
    if (actualDay > dateStr) ms -= 24 * 60 * 60_000;
  }

  return new Date(ms);
}

/** Noon on the YYYY-MM-DD key, matching the web wizard's slots query. */
export function calendarDateFromKey(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00`);
}
