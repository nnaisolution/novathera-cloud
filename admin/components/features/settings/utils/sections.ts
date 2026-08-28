import type { SectionDef } from '@/components/features/settings/types'

/**
 * Common IANA zones for Canadian clinics. The backend accepts any valid zone,
 * so this is a convenience list rather than a restriction.
 */
const TIMEZONE_OPTIONS = [
  'America/St_Johns',
  'America/Halifax',
  'America/Toronto',
  'America/Winnipeg',
  'America/Regina',
  'America/Edmonton',
  'America/Vancouver',
].map((zone) => ({ value: zone, label: zone.replace('America/', '') }))

export const SETTINGS_SECTIONS: SectionDef[] = [
  {
    group: 'business',
    title: 'Business',
    description:
      'Identity and locale. Timezone and currency drive every figure on the dashboard.',
    fields: [
      { type: 'text', name: 'clinicName', label: 'Clinic name' },
      {
        type: 'email',
        name: 'supportEmail',
        label: 'Support email',
        placeholder: 'hello@novathera.ca',
      },
      { type: 'text', name: 'supportPhone', label: 'Support phone' },
      {
        type: 'select',
        name: 'timezone',
        label: 'Reporting timezone',
        hint: 'Days on the dashboard are bucketed in this zone.',
        options: TIMEZONE_OPTIONS,
      },
      {
        type: 'select',
        name: 'currency',
        label: 'Currency',
        options: [
          { value: 'CAD', label: 'CAD — Canadian dollar' },
          { value: 'USD', label: 'USD — US dollar' },
        ],
      },
    ],
  },
  {
    group: 'booking',
    title: 'Booking policy',
    description: 'Defaults applied across the booking flow.',
    fields: [
      {
        type: 'number',
        name: 'minAdvanceMinutes',
        label: 'Minimum notice',
        suffix: 'minutes',
        min: 0,
        max: 10080,
        hint: 'How far ahead a customer must book.',
      },
      {
        type: 'number',
        name: 'maxAdvanceDays',
        label: 'Booking horizon',
        suffix: 'days',
        min: 1,
        max: 365,
      },
      {
        type: 'number',
        name: 'cancellationWindowHours',
        label: 'Free cancellation window',
        suffix: 'hours',
        min: 0,
        max: 168,
      },
      {
        type: 'money',
        name: 'lateCancellationFeeCents',
        label: 'Late cancellation fee',
      },
      { type: 'money', name: 'noShowFeeCents', label: 'No-show fee' },
      {
        type: 'switch',
        name: 'allowFamilyMemberBooking',
        label: 'Allow booking on behalf of family members',
      },
    ],
  },
  {
    group: 'commerce',
    title: 'Commerce',
    description: 'Shop, stock and tax behaviour.',
    fields: [
      {
        type: 'money',
        name: 'freeShippingThresholdCents',
        label: 'Free shipping over',
      },
      {
        type: 'number',
        name: 'defaultLowStockThreshold',
        label: 'Default low-stock threshold',
        suffix: 'units',
        min: 0,
        max: 1000,
      },
      {
        type: 'switch',
        name: 'automaticTax',
        label: 'Stripe automatic tax',
        hint: 'Requires a configured tax head office in Stripe.',
      },
      {
        type: 'switch',
        name: 'allowBackorders',
        label: 'Allow backorders by default',
      },
    ],
  },
  {
    group: 'notifications',
    title: 'Notifications',
    description: 'Who hears about what, and from whom.',
    fields: [
      { type: 'text', name: 'fromName', label: 'Sender name' },
      {
        type: 'emails',
        name: 'adminRecipients',
        label: 'Admin recipients',
        hint: 'Comma separated. Receives internal notifications.',
      },
      {
        type: 'switch',
        name: 'sendOrderConfirmation',
        label: 'Send order confirmation emails',
      },
      {
        type: 'switch',
        name: 'sendShippingNotification',
        label: 'Send shipping notification emails',
      },
      {
        type: 'switch',
        name: 'notifyOnNewBooking',
        label: 'Notify admins on every new booking',
      },
    ],
  },
  {
    group: 'security',
    title: 'Security',
    description: 'Session lifetime and sign-in rate limiting.',
    notice:
      'Better Auth reads these once when the API starts. Saving stores them immediately, but they take effect after the next API restart.',
    fields: [
      {
        type: 'number',
        name: 'sessionExpiresInDays',
        label: 'Session lifetime',
        suffix: 'days',
        min: 1,
        max: 90,
      },
      {
        type: 'number',
        name: 'sessionUpdateAgeHours',
        label: 'Refresh session every',
        suffix: 'hours',
        min: 1,
        max: 720,
      },
      {
        type: 'number',
        name: 'freshAgeMinutes',
        label: 'Re-auth window for sensitive actions',
        suffix: 'minutes',
        min: 0,
        max: 1440,
      },
      {
        type: 'number',
        name: 'signInMaxAttempts',
        label: 'Sign-in attempts allowed',
        min: 1,
        max: 100,
      },
      {
        type: 'number',
        name: 'signInWindowSeconds',
        label: 'Sign-in rate limit window',
        suffix: 'seconds',
        min: 10,
        max: 3600,
      },
      {
        type: 'select',
        name: 'rateLimitStorage',
        label: 'Rate limit storage',
        hint: 'Database survives an API restart; memory does not.',
        options: [
          { value: 'database', label: 'Database' },
          { value: 'memory', label: 'Memory' },
        ],
      },
      {
        type: 'switch',
        name: 'requireEmailVerification',
        label: 'Require email verification to sign in',
      },
    ],
  },
  {
    group: 'dashboard',
    title: 'Dashboard',
    description: 'Thresholds that decide when a figure is flagged.',
    fields: [
      {
        type: 'number',
        name: 'noShowWarningPercent',
        label: 'Flag no-show rate above',
        suffix: '%',
        min: 0,
        max: 100,
        step: 0.5,
      },
      {
        type: 'number',
        name: 'cancellationWarningPercent',
        label: 'Flag cancellation rate above',
        suffix: '%',
        min: 0,
        max: 100,
        step: 0.5,
      },
      {
        type: 'number',
        name: 'certificationWarningDays',
        label: 'Warn about certifications expiring within',
        suffix: 'days',
        min: 1,
        max: 365,
      },
      {
        type: 'number',
        name: 'lowStockPanelLimit',
        label: 'Rows in action-queue panels',
        min: 1,
        max: 20,
      },
    ],
  },
]
