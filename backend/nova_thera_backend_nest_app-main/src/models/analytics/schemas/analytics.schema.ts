import { z } from 'zod';

export const ANALYTICS_PRESETS = ['30d', '60d', '90d', 'custom'] as const;

export type AnalyticsPreset = (typeof ANALYTICS_PRESETS)[number];

/**
 * `custom` requires an explicit from/to. The presets ignore any dates sent
 * alongside them so the client can keep the pickers populated while switching.
 */
export const analyticsRangeInputSchema = z
  .object({
    preset: z.enum(ANALYTICS_PRESETS).default('30d'),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.preset !== 'custom') return;

    if (!value.from || !value.to) {
      ctx.addIssue({
        code: 'custom',
        message: 'A custom range needs both a start and end date',
        path: ['from'],
      });
      return;
    }

    if (value.to < value.from) {
      ctx.addIssue({
        code: 'custom',
        message: 'End date must be on or after the start date',
        path: ['to'],
      });
    }
  });

export type AnalyticsRangeInput = z.infer<typeof analyticsRangeInputSchema>;
