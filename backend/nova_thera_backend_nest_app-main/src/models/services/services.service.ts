import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { paginatedResponse } from '../../common/schemas/pagination.schema';
import { handlePrismaError } from '../../common/helpers/prisma-errors';
import { uniqueSlug } from '../../common/helpers/slug';
import { StripeCatalogService } from '../../providers/payments/stripe/stripe-catalog.service';
import { ServicesRepository } from './services.repository';
import type {
  CreateServiceInput,
  ListServicesInput,
  PublicListServicesInput,
  UpdateServiceInput,
} from './schemas/service.schema';

@Injectable()
export class ServicesService {
  constructor(
    private readonly repository: ServicesRepository,
    private readonly stripeCatalog: StripeCatalogService,
  ) {}

  private async syncStripeProduct(service: {
    id: string;
    name: string;
    shortDescription: string | null;
    standardPriceCents: number;
    currency: string;
    stripeProductId: string | null;
    stripePriceId: string | null;
  }) {
    const synced = await this.stripeCatalog.syncProduct({
      id: service.id,
      name: service.name,
      description: service.shortDescription,
      priceCents: service.standardPriceCents,
      currency: service.currency,
      stripeProductId: service.stripeProductId,
      stripePriceId: service.stripePriceId,
      metadata: { type: 'service' },
    });
    if (!synced) return service;
    if (
      synced.stripeProductId !== service.stripeProductId ||
      synced.stripePriceId !== service.stripePriceId
    ) {
      await this.repository.updateStripeIds(
        service.id,
        synced.stripeProductId,
        synced.stripePriceId,
      );
      return {
        ...service,
        stripeProductId: synced.stripeProductId,
        stripePriceId: synced.stripePriceId,
      };
    }
    return service;
  }

  async list(input: ListServicesInput) {
    const { items, total } = await this.repository.findMany(input);
    return paginatedResponse(items, total, input.page, input.limit);
  }

  async publicList(input: PublicListServicesInput) {
    return this.repository.findManyPublic(input);
  }

  async publicFacets() {
    return this.repository.findPublicFacets();
  }

  async publicGetBySlug(slug: string) {
    const service = await this.repository.findBySlugPublic(slug);
    if (!service) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Service not found' });
    }
    return service;
  }

  async getById(id: string) {
    const service = await this.repository.findById(id);
    if (!service) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Service not found' });
    }
    return service;
  }

  async create(input: CreateServiceInput) {
    const { locations, staffEmployeeIds, ...data } = input;

    try {
      await this.repository.validateActiveEmployees(staffEmployeeIds);
      const slug = await uniqueSlug(input.name, (value) =>
        this.repository.slugExists(value),
      );
      const service = await this.repository.create(
        { ...data, slug },
        locations,
        staffEmployeeIds,
      );
      if (!service) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
      const synced = await this.syncStripeProduct({
        id: service.id,
        name: service.name,
        shortDescription: service.shortDescription,
        standardPriceCents: service.standardPriceCents,
        currency: service.currency,
        stripeProductId: service.stripeProductId,
        stripePriceId: service.stripePriceId,
      });
      return synced === service ? service : await this.getById(service.id);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      if (error instanceof Error && error.message === 'INVALID_EMPLOYEES') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'One or more selected employees are invalid or inactive',
        });
      }
      handlePrismaError(error);
    }
  }

  async update(input: UpdateServiceInput) {
    const { id, locations, staffEmployeeIds, ...data } = input;
    await this.getById(id);

    try {
      if (staffEmployeeIds) {
        await this.repository.validateActiveEmployees(staffEmployeeIds);
      }

      const updateData: Omit<
        UpdateServiceInput,
        'id' | 'locations' | 'staffEmployeeIds'
      > & { slug?: string } = { ...data };
      if (data.name) {
        updateData.slug = await uniqueSlug(data.name, (value) =>
          this.repository.slugExists(value, id),
        );
      }

      const service = await this.repository.update(
        id,
        updateData,
        locations,
        staffEmployeeIds,
      );
      if (!service) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }

      const shouldSync =
        !service.stripeProductId ||
        !service.stripePriceId ||
        data.name !== undefined ||
        data.shortDescription !== undefined ||
        data.standardPriceCents !== undefined;

      if (shouldSync) {
        const synced = await this.syncStripeProduct({
          id: service.id,
          name: service.name,
          shortDescription: service.shortDescription,
          standardPriceCents: service.standardPriceCents,
          currency: service.currency,
          stripeProductId: service.stripeProductId,
          stripePriceId: service.stripePriceId,
        });
        return synced === service ? service : await this.getById(service.id);
      }

      return service;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      if (error instanceof Error && error.message === 'INVALID_EMPLOYEES') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'One or more selected employees are invalid or inactive',
        });
      }
      handlePrismaError(error);
    }
  }

  async delete(id: string) {
    await this.getById(id);
    const activePackages = await this.repository.countActivePackages(id);
    if (activePackages > 0) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Cannot delete a service with active packages',
      });
    }

    try {
      return await this.repository.softDelete(id);
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
