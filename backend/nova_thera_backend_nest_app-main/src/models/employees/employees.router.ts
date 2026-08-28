import { permissionProcedure, router } from '../../trpc/trpc';
import { EmployeesService } from './employees.service';
import {
  createEmployeeInputSchema,
  employeeIdInputSchema,
  listEmployeesInputSchema,
  setEmployeeStatusInputSchema,
  updateEmployeeInputSchema,
} from './schemas/employee.schema';

export function createEmployeesRouter(service: EmployeesService) {
  return router({
    list: permissionProcedure('employee', 'read')
      .input(listEmployeesInputSchema)
      .query(({ input }) => service.list(input)),

    getById: permissionProcedure('employee', 'read')
      .input(employeeIdInputSchema)
      .query(({ input }) => service.getById(input.id)),

    create: permissionProcedure('employee', 'create')
      .input(createEmployeeInputSchema)
      .mutation(({ input, ctx }) => service.create(input, ctx.headers)),

    update: permissionProcedure('employee', 'update')
      .input(updateEmployeeInputSchema)
      .mutation(({ input, ctx }) => service.update(input, ctx.headers)),

    setStatus: permissionProcedure('employee', 'update')
      .input(setEmployeeStatusInputSchema)
      .mutation(({ input, ctx }) =>
        service.setStatus(input.id, input.status, ctx.headers),
      ),

    delete: permissionProcedure('employee', 'delete')
      .input(employeeIdInputSchema)
      .mutation(({ input, ctx }) => service.delete(input.id, ctx.headers)),
  });
}
