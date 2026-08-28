import { z } from 'zod';
import { employeeScheduleSchema } from '../../../common/schemas/schedule.schema';
import { paginationInputSchema } from '../../../common/schemas/pagination.schema';

export const genderSchema = z.enum([
  'MALE',
  'FEMALE',
  'OTHER',
  'PREFER_NOT_TO_SAY',
]);

export const employmentTypeSchema = z.enum([
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
]);

export const employeeStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);

export const employeeRoleSchema = z.enum([
  'admin',
  'manager',
  'staff',
  'receptionist',
]);

export const certificationInputSchema = z
  .object({
    name: z.string().min(1).max(200),
    qualification: z.string().max(200).optional(),
    licenseNumber: z.string().max(100).optional(),
    expiresAt: z.coerce.date().optional(),
  })
  .strict();

const sixteenYearsAgo = new Date();
sixteenYearsAgo.setFullYear(sixteenYearsAgo.getFullYear() - 16);

export const createEmployeeInputSchema = z
  .object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    photoUrl: z.string().url().optional(),
    dateOfBirth: z.coerce
      .date()
      .max(sixteenYearsAgo, {
        message: 'Employee must be at least 16 years old',
      })
      .optional(),
    gender: genderSchema.optional(),
    personalPhone: z
      .string()
      .regex(/^[+\d\s()-]{7,30}$/)
      .optional(),
    personalEmail: z.string().email().optional(),
    emergencyContactName: z.string().max(200).optional(),
    emergencyContactPhone: z
      .string()
      .regex(/^[+\d\s()-]{7,30}$/)
      .optional(),
    jobTitle: z.string().min(1).max(200),
    department: z.string().min(1).max(200),
    employmentType: employmentTypeSchema,
    startDate: z.coerce.date(),
    locationId: z.string().min(1).optional(),
    workEmail: z.string().email(),
    role: employeeRoleSchema.default('staff'),
    schedule: employeeScheduleSchema,
    bufferMinutes: z.number().int().min(0).max(120).default(0),
    maxDailyAppointments: z.number().int().min(1).max(100).optional(),
    certifications: z.array(certificationInputSchema).max(20).default([]),
  })
  .strict();

export const updateEmployeeInputSchema = createEmployeeInputSchema
  .partial()
  .extend({
    id: z.string().min(1),
  })
  .strict();

export const listEmployeesInputSchema = paginationInputSchema
  .extend({
    search: z.string().max(200).optional(),
    department: z.string().max(200).optional(),
    locationId: z.string().min(1).optional(),
    status: employeeStatusSchema.optional(),
    employmentType: employmentTypeSchema.optional(),
    sortBy: z
      .enum(['firstName', 'lastName', 'createdAt', 'startDate', 'status'])
      .default('createdAt'),
  })
  .strict();

export const employeeIdInputSchema = z
  .object({
    id: z.string().min(1),
  })
  .strict();

export const setEmployeeStatusInputSchema = z
  .object({
    id: z.string().min(1),
    status: employeeStatusSchema,
  })
  .strict();

export type CreateEmployeeInput = z.infer<typeof createEmployeeInputSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeInputSchema>;
export type ListEmployeesInput = z.infer<typeof listEmployeesInputSchema>;
