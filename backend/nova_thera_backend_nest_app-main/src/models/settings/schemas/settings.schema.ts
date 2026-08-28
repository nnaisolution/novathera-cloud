import { z } from 'zod';

/**
 * Admin-editable configuration, grouped. Each group is stored as one row in
 * `app_setting` keyed by the group name, with the parsed object as the value.
 *
 * Every field has a default here, so a fresh database needs no seeding — a
 * missing row simply means "all defaults".
 */

const IANA_TIMEZONE = z
  .string()
  .min(1)
  .refine(
    (value) => {
      try {
        new Intl.DateTimeFormat('en-CA', { timeZone: value });
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Must be a valid IANA timezone, e.g. America/Edmonton' },
  );

const emailList = z
  .array(z.string().email())
  .max(10, 'At most 10 recipients')
  .default([]);

export const businessSettingsSchema = z
  .object({
    clinicName: z.string().min(1).max(80).default('Nova Thera'),
    supportEmail: z.string().email().or(z.literal('')).default(''),
    supportPhone: z.string().max(30).default(''),
    timezone: IANA_TIMEZONE.default('America/Edmonton'),
    currency: z.enum(['CAD', 'USD']).default('CAD'),
  })
  .strict();

export const bookingSettingsSchema = z
  .object({
    minAdvanceMinutes: z.number().int().min(0).max(10080).default(120),
    maxAdvanceDays: z.number().int().min(1).max(365).default(60),
    cancellationWindowHours: z.number().int().min(0).max(168).default(24),
    lateCancellationFeeCents: z.number().int().min(0).default(0),
    noShowFeeCents: z.number().int().min(0).default(0),
    allowFamilyMemberBooking: z.boolean().default(true),
  })
  .strict();

export const commerceSettingsSchema = z
  .object({
    freeShippingThresholdCents: z.number().int().min(0).default(7500),
    defaultLowStockThreshold: z.number().int().min(0).max(1000).default(5),
    automaticTax: z.boolean().default(false),
    allowBackorders: z.boolean().default(false),
  })
  .strict();

export const notificationSettingsSchema = z
  .object({
    fromName: z.string().min(1).max(80).default('Nova Thera'),
    adminRecipients: emailList,
    sendOrderConfirmation: z.boolean().default(true),
    sendShippingNotification: z.boolean().default(true),
    notifyOnNewBooking: z.boolean().default(false),
  })
  .strict();

/**
 * Applied when the auth instance is constructed, so changes here take effect
 * on the next API restart. The UI says so explicitly.
 */
export const securitySettingsSchema = z
  .object({
    sessionExpiresInDays: z.number().int().min(1).max(90).default(7),
    sessionUpdateAgeHours: z.number().int().min(1).max(720).default(24),
    freshAgeMinutes: z.number().int().min(0).max(1440).default(60),
    signInMaxAttempts: z.number().int().min(1).max(100).default(5),
    signInWindowSeconds: z.number().int().min(10).max(3600).default(60),
    rateLimitStorage: z.enum(['memory', 'database']).default('database'),
    requireEmailVerification: z.boolean().default(true),
  })
  .strict();

export const dashboardSettingsSchema = z
  .object({
    noShowWarningPercent: z.number().min(0).max(100).default(8),
    cancellationWarningPercent: z.number().min(0).max(100).default(15),
    certificationWarningDays: z.number().int().min(1).max(365).default(60),
    lowStockPanelLimit: z.number().int().min(1).max(20).default(5),
  })
  .strict();

export const SETTING_SCHEMAS = {
  business: businessSettingsSchema,
  booking: bookingSettingsSchema,
  commerce: commerceSettingsSchema,
  notifications: notificationSettingsSchema,
  security: securitySettingsSchema,
  dashboard: dashboardSettingsSchema,
} as const;

export const SETTING_GROUPS = Object.keys(SETTING_SCHEMAS) as [
  SettingGroup,
  ...SettingGroup[],
];

export type SettingGroup = keyof typeof SETTING_SCHEMAS;

export type SettingsBundle = {
  [K in SettingGroup]: z.infer<(typeof SETTING_SCHEMAS)[K]>;
};

/** Defaults for every group, derived from the schemas themselves. */
export function defaultSettings(): SettingsBundle {
  return {
    business: businessSettingsSchema.parse({}),
    booking: bookingSettingsSchema.parse({}),
    commerce: commerceSettingsSchema.parse({}),
    notifications: notificationSettingsSchema.parse({}),
    security: securitySettingsSchema.parse({}),
    dashboard: dashboardSettingsSchema.parse({}),
  };
}

/**
 * Discriminated input so a caller can only ever send a payload matching the
 * group it names.
 */
export const updateSettingsInputSchema = z.discriminatedUnion('group', [
  z.object({ group: z.literal('business'), values: businessSettingsSchema }),
  z.object({ group: z.literal('booking'), values: bookingSettingsSchema }),
  z.object({ group: z.literal('commerce'), values: commerceSettingsSchema }),
  z.object({
    group: z.literal('notifications'),
    values: notificationSettingsSchema,
  }),
  z.object({ group: z.literal('security'), values: securitySettingsSchema }),
  z.object({ group: z.literal('dashboard'), values: dashboardSettingsSchema }),
]);

export type UpdateSettingsInput = z.infer<typeof updateSettingsInputSchema>;
