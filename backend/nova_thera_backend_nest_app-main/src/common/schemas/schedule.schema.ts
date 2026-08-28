import { z } from 'zod';

export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export const operatingDaySchema = z
  .object({
    day: z.enum(DAYS_OF_WEEK),
    isOpen: z.boolean(),
    openTime: timeSchema,
    closeTime: timeSchema,
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.isOpen && value.closeTime <= value.openTime) {
      ctx.addIssue({
        code: 'custom',
        message: 'Close time must be after open time',
        path: ['closeTime'],
      });
    }
  });

export const operatingHoursSchema = z
  .array(operatingDaySchema)
  .length(7)
  .superRefine((days, ctx) => {
    const seen = new Set<string>();
    for (const [index, day] of days.entries()) {
      if (seen.has(day.day)) {
        ctx.addIssue({
          code: 'custom',
          message: `Duplicate day: ${day.day}`,
          path: [index, 'day'],
        });
      }
      seen.add(day.day);
    }
    for (const required of DAYS_OF_WEEK) {
      if (!seen.has(required)) {
        ctx.addIssue({
          code: 'custom',
          message: `Missing day: ${required}`,
        });
      }
    }
  });

export const employeeScheduleDaySchema = z
  .object({
    day: z.enum(DAYS_OF_WEEK),
    isWorking: z.boolean(),
    startTime: timeSchema,
    endTime: timeSchema,
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.isWorking && value.endTime <= value.startTime) {
      ctx.addIssue({
        code: 'custom',
        message: 'End time must be after start time',
        path: ['endTime'],
      });
    }
  });

export const employeeScheduleSchema = z
  .array(employeeScheduleDaySchema)
  .length(7)
  .superRefine((days, ctx) => {
    const seen = new Set<string>();
    for (const [index, day] of days.entries()) {
      if (seen.has(day.day)) {
        ctx.addIssue({
          code: 'custom',
          message: `Duplicate day: ${day.day}`,
          path: [index, 'day'],
        });
      }
      seen.add(day.day);
    }
    for (const required of DAYS_OF_WEEK) {
      if (!seen.has(required)) {
        ctx.addIssue({
          code: 'custom',
          message: `Missing day: ${required}`,
        });
      }
    }
  });

export type OperatingDay = z.infer<typeof operatingDaySchema>;
export type OperatingHours = z.infer<typeof operatingHoursSchema>;
export type EmployeeScheduleDay = z.infer<typeof employeeScheduleDaySchema>;
export type EmployeeSchedule = z.infer<typeof employeeScheduleSchema>;

export const defaultOperatingHours: OperatingHours = DAYS_OF_WEEK.map(
  (day) => ({
    day,
    isOpen: day !== 'sunday',
    openTime: '09:00',
    closeTime: '17:00',
  }),
);

export const defaultEmployeeSchedule: EmployeeSchedule = DAYS_OF_WEEK.map(
  (day) => ({
    day,
    isWorking: day !== 'sunday',
    startTime: '09:00',
    endTime: '17:00',
  }),
);
