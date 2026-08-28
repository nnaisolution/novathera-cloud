import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { APIError } from 'better-auth/api';
import { AuthService } from '@thallesp/nestjs-better-auth';
import type { AuthInstance } from '../../authentication/auth.factory';
import { randomBytes } from 'node:crypto';
import { paginatedResponse } from '../../common/schemas/pagination.schema';
import { handlePrismaError } from '../../common/helpers/prisma-errors';
import { EmployeesRepository } from './employees.repository';
import type {
  CreateEmployeeInput,
  ListEmployeesInput,
  UpdateEmployeeInput,
} from './schemas/employee.schema';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly repository: EmployeesRepository,
    private readonly authService: AuthService<AuthInstance>,
  ) {}

  private async enrichWithUser<T extends { userId: string }>(employee: T) {
    const user = await this.repository.findUserById(employee.userId);
    return {
      ...employee,
      workEmail: user?.email ?? null,
      role: user?.role ?? null,
      banned: user?.banned ?? false,
    };
  }

  async list(input: ListEmployeesInput) {
    const { items, total } = await this.repository.findMany(input);
    const enriched = await Promise.all(
      items.map((item) => this.enrichWithUser(item)),
    );
    return paginatedResponse(enriched, total, input.page, input.limit);
  }

  async getById(id: string) {
    const employee = await this.repository.findById(id);
    if (!employee) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Employee not found' });
    }
    return this.enrichWithUser(employee);
  }

  async create(input: CreateEmployeeInput, headers: Headers) {
    const {
      workEmail,
      role,
      certifications,
      firstName,
      lastName,
      ...employeeData
    } = input;
    const tempPassword = randomBytes(12).toString('base64url');
    const name = `${firstName} ${lastName}`.trim();
    let createdUserId: string | null = null;

    try {
      const createdUser = await this.authService.api.createUser({
        body: {
          email: workEmail,
          password: tempPassword,
          name,
          role,
        },
        headers,
      });

      createdUserId = createdUser.user.id;
      const employeeCode = await this.repository.getNextEmployeeCode();

      const employee = await this.repository.create(
        {
          ...employeeData,
          firstName,
          lastName,
          userId: createdUserId,
          employeeCode,
        },
        certifications,
      );

      return {
        employee: await this.enrichWithUser(employee),
        tempPassword,
      };
    } catch (error) {
      if (createdUserId) {
        try {
          await this.authService.api.removeUser({
            body: { userId: createdUserId },
            headers,
          });
        } catch {
          // best-effort cleanup
        }
      }

      if (
        error instanceof Error &&
        (error.message.includes('already exists') ||
          error.message.includes('unique'))
      ) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A user with this work email already exists',
        });
      }

      if (error instanceof APIError) {
        throw new TRPCError({
          code:
            error.status === 'FORBIDDEN'
              ? 'FORBIDDEN'
              : error.status === 'NOT_FOUND'
                ? 'NOT_FOUND'
                : 'BAD_REQUEST',
          message: error.message ?? 'Failed to create employee account',
        });
      }

      handlePrismaError(error);
    }
  }

  async update(input: UpdateEmployeeInput, headers: Headers) {
    const existing = await this.getById(input.id);
    const {
      workEmail,
      role,
      certifications,
      firstName,
      lastName,
      id,
      ...employeeData
    } = input;

    try {
      if (role && role !== existing.role) {
        await this.authService.api.setRole({
          body: { userId: existing.userId, role },
          headers,
        });
      }

      if (workEmail && workEmail !== existing.workEmail) {
        await this.authService.api.adminUpdateUser({
          body: {
            userId: existing.userId,
            data: { email: workEmail },
          },
          headers,
        });
      }

      if (firstName || lastName) {
        const name =
          `${firstName ?? existing.firstName} ${lastName ?? existing.lastName}`.trim();
        await this.authService.api.adminUpdateUser({
          body: {
            userId: existing.userId,
            data: { name },
          },
          headers,
        });
      }

      const employee = await this.repository.update(
        id,
        {
          ...employeeData,
          ...(firstName ? { firstName } : {}),
          ...(lastName ? { lastName } : {}),
        },
        certifications,
      );

      return this.enrichWithUser(employee);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes('already exists') ||
          error.message.includes('unique'))
      ) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A user with this work email already exists',
        });
      }

      handlePrismaError(error);
    }
  }

  async setStatus(id: string, status: 'ACTIVE' | 'INACTIVE', headers: Headers) {
    const existing = await this.getById(id);

    try {
      if (status === 'INACTIVE') {
        await this.authService.api.banUser({
          body: { userId: existing.userId },
          headers,
        });
      } else {
        await this.authService.api.unbanUser({
          body: { userId: existing.userId },
          headers,
        });
      }

      const employee = await this.repository.update(id, { status });
      return this.enrichWithUser(employee);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async delete(id: string, headers: Headers) {
    const existing = await this.getById(id);

    try {
      await this.authService.api.banUser({
        body: { userId: existing.userId },
        headers,
      });
      await this.repository.softDelete(id);
      return { success: true };
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
