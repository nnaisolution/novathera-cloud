import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { handlePrismaError } from '../../common/helpers/prisma-errors';
import { ServiceCategoriesRepository } from './service-categories.repository';
import type {
  CreateServiceCategoryInput,
  UpdateServiceCategoryInput,
} from './schemas/service-category.schema';

@Injectable()
export class ServiceCategoriesService {
  constructor(private readonly repository: ServiceCategoriesRepository) {}

  async list() {
    return this.repository.findAll();
  }

  async publicList() {
    return this.repository.findAllPublic();
  }

  async getById(id: string) {
    const category = await this.repository.findById(id);
    if (!category) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Category not found' });
    }
    return category;
  }

  async create(input: CreateServiceCategoryInput) {
    try {
      return await this.repository.create(input);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(input: UpdateServiceCategoryInput) {
    const { id, ...data } = input;
    await this.getById(id);
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

  async reorder(orderedIds: string[]) {
    try {
      return await this.repository.reorder(orderedIds);
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
