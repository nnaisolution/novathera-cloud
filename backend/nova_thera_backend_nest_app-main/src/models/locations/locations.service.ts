import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { paginatedResponse } from '../../common/schemas/pagination.schema';
import { handlePrismaError } from '../../common/helpers/prisma-errors';
import { uniqueSlug } from '../../common/helpers/slug';
import { LocationsRepository } from './locations.repository';
import type {
  CreateLocationInput,
  ListLocationsInput,
  PublicListLocationsInput,
  UpdateLocationInput,
} from './schemas/location.schema';

@Injectable()
export class LocationsService {
  constructor(private readonly repository: LocationsRepository) {}

  async list(input: ListLocationsInput) {
    const { items, total } = await this.repository.findMany(input);
    return paginatedResponse(items, total, input.page, input.limit);
  }

  async publicList(input: PublicListLocationsInput) {
    return this.repository.findManyPublic(input);
  }

  async publicCities() {
    return this.repository.distinctCities();
  }

  async getById(id: string) {
    const location = await this.repository.findById(id);
    if (!location) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Location not found' });
    }
    return location;
  }

  async create(input: CreateLocationInput) {
    try {
      const slug = await uniqueSlug(input.name, (value) =>
        this.repository.slugExists(value),
      );
      return await this.repository.create({ ...input, slug });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(input: UpdateLocationInput) {
    const { id, ...data } = input;
    await this.getById(id);

    try {
      const updateData: Omit<UpdateLocationInput, 'id'> & { slug?: string } = {
        ...data,
      };
      if (data.name) {
        updateData.slug = await uniqueSlug(data.name, (value) =>
          this.repository.slugExists(value, id),
        );
      }
      return await this.repository.update(id, updateData);
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
