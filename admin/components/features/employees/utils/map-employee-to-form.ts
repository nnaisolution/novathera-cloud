import {
  defaultEmployeeFormValues,
  type EmployeeFormValues,
} from '../schemas/employee.schema'

export function mapEmployeeToForm(
  employee: Record<string, unknown>,
): EmployeeFormValues {
  return {
    firstName: String(employee.firstName ?? ''),
    lastName: String(employee.lastName ?? ''),
    photoUrl: String(employee.photoUrl ?? ''),
    dateOfBirth: employee.dateOfBirth
      ? new Date(String(employee.dateOfBirth)).toISOString().slice(0, 10)
      : '',
    gender: employee.gender as EmployeeFormValues['gender'],
    personalPhone: String(employee.personalPhone ?? ''),
    personalEmail: String(employee.personalEmail ?? ''),
    emergencyContactName: String(employee.emergencyContactName ?? ''),
    emergencyContactPhone: String(employee.emergencyContactPhone ?? ''),
    jobTitle: String(employee.jobTitle ?? ''),
    department: String(employee.department ?? ''),
    employmentType: employee.employmentType as EmployeeFormValues['employmentType'],
    startDate: new Date(String(employee.startDate)).toISOString().slice(0, 10),
    locationId: String(employee.locationId ?? ''),
    workEmail: String(employee.workEmail ?? ''),
    role: (employee.role as EmployeeFormValues['role']) ?? 'staff',
    schedule: employee.schedule as EmployeeFormValues['schedule'],
    bufferMinutes: Number(employee.bufferMinutes ?? 0),
    maxDailyAppointments: employee.maxDailyAppointments
      ? Number(employee.maxDailyAppointments)
      : undefined,
    certifications:
      (employee.certifications as EmployeeFormValues['certifications']) ?? [],
  }
}

export { defaultEmployeeFormValues }
