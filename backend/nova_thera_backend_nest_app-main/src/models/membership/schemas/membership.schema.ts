import { z } from 'zod';
import { MEMBERSHIP_PLAN_IDS } from '../membership-plans';

export const membershipPlanIdSchema = z.enum(MEMBERSHIP_PLAN_IDS);

export const upgradePlanInputSchema = z
  .object({ planId: membershipPlanIdSchema })
  .strict();

export type UpgradePlanInput = z.infer<typeof upgradePlanInputSchema>;
