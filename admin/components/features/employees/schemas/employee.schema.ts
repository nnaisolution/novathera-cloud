import { z } from 'zod'

export const DAYS = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
] as const

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)

export const scheduleDaySchema = z.object({
  day: z.enum(DAYS),
  isWorking: z.boolean(),
  startTime: timeSchema,
  endTime: timeSchema,
})

export const employeeFormSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  photoUrl: z.string().url().optional().or(z.literal('')),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  personalPhone: z.string().optional(),
  personalEmail: z.string().email().optional().or(z.literal('')),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  jobTitle: z.string().min(1).max(200),
  department: z.string().min(1).max(200),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT']),
  startDate: z.string().min(1),
  locationId: z.string().optional(),
  workEmail: z.string().email(),
  role: z.enum(['admin', 'manager', 'staff', 'receptionist']),
  schedule: z.array(scheduleDaySchema).length(7),
  bufferMinutes: z.coerce.number().int().min(0),
  maxDailyAppointments: z.coerce.number().int().min(1).optional(),
  certifications: z.array(z.object({
    name: z.string().min(1),
    qualification: z.string().optional(),
    licenseNumber: z.string().optional(),
    expiresAt: z.string().optional(),
  })),
})

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>

export const defaultSchedule = DAYS.map((day) => ({
  day,
  isWorking: day !== 'sunday',
  startTime: '09:00',
  endTime: '17:00',
}))

export const defaultEmployeeFormValues: EmployeeFormValues = {
  firstName: '',
  lastName: '',
  photoUrl: '',
  dateOfBirth: '',
  personalPhone: '',
  personalEmail: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  jobTitle: '',
  department: '',
  employmentType: 'FULL_TIME',
  startDate: new Date().toISOString().slice(0, 10),
  locationId: '',
  workEmail: '',
  role: 'staff',
  schedule: defaultSchedule,
  bufferMinutes: 0,
  certifications: [],
}
