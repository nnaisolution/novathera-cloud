import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { paginatedResponse } from '../../common/schemas/pagination.schema';
import { handlePrismaError } from '../../common/helpers/prisma-errors';
import { PackagesRepository } from './packages.repository';
import type {
  CreatePackageInput,
  ListPackagesInput,
  UpdatePackageInput,
} from './schemas/package.schema';

@Injectable()
export class PackagesService {
  constructor(private readonly repository: PackagesRepository) {}

  async list(input: ListPackagesInput) {
    const { items, total } = await this.repository.findMany(input);
    return paginatedResponse(items, total, input.page, input.limit);
  }

  async getById(id: string) {
    const pkg = await this.repository.findById(id);
    if (!pkg) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Package not found' });
    }
    return pkg;
  }

  private async validateReferences(serviceId: string, locationIds: string[]) {
    const service = await this.repository.validateService(serviceId);
    if (!service) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid service',
      });
    }
    try {
      await this.repository.validateLocations(locationIds);
    } catch (error) {
      if (error instanceof Error && error.message === 'INVALID_LOCATIONS') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'One or more locations are invalid',
        });
      }
      throw error;
    }
  }

  async create(input: CreatePackageInput) {
    await this.validateReferences(input.serviceId, input.locationIds);
    try {
      return await this.repository.create(input);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(input: UpdatePackageInput) {
    const { id, ...data } = input;
    const existing = await this.getById(id);

    await this.validateReferences(
      data.serviceId ?? existing.serviceId,
      data.locationIds ?? existing.locationIds,
    );

    try {
      return await this.repository.update(id, data);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async delete(id: string) {
    await this.getById(id);
    try {
      return await this.repository.softDelete(id);
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
