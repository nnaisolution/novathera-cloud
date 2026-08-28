import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Include at least one lowercase letter")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[0-9]/, "Include at least one number")
  .regex(/[^A-Za-z0-9]/, "Include at least one special character");

export const registerStep1Schema = z
  .object({
    email: z.string().trim().email("Enter a valid email address"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterStep1Values = z.infer<typeof registerStep1Schema>;

export const PHONE_TYPES = ["mobile", "home", "work"] as const;

export const registerStep2Schema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  countryCode: z.literal("+1"),
  phone: z
    .string()
    .trim()
    .min(10, "Enter a valid phone number")
    .max(15, "Enter a valid phone number")
    .regex(/^\d+$/, "Phone number can only contain digits"),
  phoneType: z.enum(PHONE_TYPES),
});

export type RegisterStep2Values = z.infer<typeof registerStep2Schema>;

export const REFERRAL_SOURCES = [
  "google",
  "instagram",
  "facebook",
  "friend_family",
  "doctor_referral",
  "advertisement",
  "other",
] as const;

export const REFERRAL_SOURCE_LABELS: Record<
  (typeof REFERRAL_SOURCES)[number],
  string
> = {
  google: "Google",
  instagram: "Instagram",
  facebook: "Facebook",
  friend_family: "Friend or family",
  doctor_referral: "Doctor referral",
  advertisement: "Advertisement",
  other: "Other",
};

export const registerStep3Schema = z.object({
  referralSource: z.enum(REFERRAL_SOURCES, {
    error: "Please select an option",
  }),
  marketingOptIn: z.boolean(),
});

export type RegisterStep3Values = z.infer<typeof registerStep3Schema>;

export const REGISTER_MEMBERSHIP_PLAN_IDS = [
  "essential",
  "enhanced",
  "elite",
] as const;

export const registerStep4Schema = z.object({
  membershipPlan: z.enum(REGISTER_MEMBERSHIP_PLAN_IDS).nullable(),
});

export type RegisterStep4Values = z.infer<typeof registerStep4Schema>;

export type RegisterFormValues = RegisterStep1Values &
  RegisterStep2Values &
  RegisterStep3Values &
  RegisterStep4Values & {
    name: string;
  };
