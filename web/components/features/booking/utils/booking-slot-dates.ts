const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export type BookingDateOption = {
  value: string;
  dayLabel: string;
  dayNumber: string;
  label: string;
};

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatBookingDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year!, month! - 1, day);

  const dayNumber = String(date.getDate()).padStart(2, "0");
  const monthLabel = MONTH_LABELS[date.getMonth()]!;
  return `${dayNumber} ${monthLabel} ${date.getFullYear()}`;
}

export function formatBookingOverviewDateTime(
  dateKey: string,
  timeValue: string,
) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year!, month! - 1, day);
  const dayName = DAY_LABELS[date.getDay()]!;
  const dayNumber = String(date.getDate()).padStart(2, "0");
  const monthLabel = MONTH_LABELS[date.getMonth()]!;

  const [hours, minutes] = timeValue.split(":").map(Number);
  const period = hours! >= 12 ? "PM" : "AM";
  const hour12 = hours! % 12 === 0 ? 12 : hours! % 12;
  const timeLabel = `${String(hour12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;

  return `${dayName}, ${dayNumber} ${monthLabel} ${date.getFullYear()} at ${timeLabel}`;
}

export function getBookingDateOptions(count = 10, startDate = new Date()) {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    const value = toDateKey(date);

    return {
      value,
      dayLabel: DAY_LABELS[date.getDay()]!,
      dayNumber: String(date.getDate()).padStart(2, "0"),
      label: formatBookingDateLabel(value),
    } satisfies BookingDateOption;
  });
}

export function getDefaultBookingDateKey(startDate = new Date()) {
  return getBookingDateOptions(1, startDate)[0]!.value;
}
