import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { paginatedResponse } from '../../common/schemas/pagination.schema';
import { handlePrismaError } from '../../common/helpers/prisma-errors';
import { ShippingTiersRepository } from './shipping-tiers.repository';
import type {
  CreateShippingTierInput,
  ListShippingTiersInput,
  UpdateShippingTierInput,
} from './schemas/shipping-tier.schema';

@Injectable()
export class ShippingTiersService {
  constructor(private readonly repository: ShippingTiersRepository) {}

  async list(input: ListShippingTiersInput) {
    const { items, total } = await this.repository.findMany(input);
    return paginatedResponse(items, total, input.page, input.limit);
  }

  async getById(id: string) {
    const tier = await this.repository.findById(id);
    if (!tier) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Shipping tier not found',
      });
    }
    return tier;
  }

  async create(input: CreateShippingTierInput) {
    try {
      return await this.repository.create(input);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async update(input: UpdateShippingTierInput) {
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
      return await this.repository.delete(id);
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
