import { EmployeeFormView } from '@/components/features/employees/components/employee-form-view'

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EmployeeFormView employeeId={id} />
}
