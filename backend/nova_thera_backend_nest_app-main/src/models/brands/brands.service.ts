import { Injectable, Logger } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { handlePrismaError } from '../../common/helpers/prisma-errors';
import { uniqueSlug } from '../../common/helpers/slug';
import { paginatedResponse } from '../../common/schemas/pagination.schema';
import { StripeConnectService } from '../../providers/payments/stripe/stripe-connect.service';
import { BrandsRepository } from './brands.repository';
import type {
  CreateBrandInput,
  ListBrandsInput,
  UpdateBrandInput,
} from './schemas/brand.schema';

@Injectable()
export class BrandsService {
  private readonly logger = new Logger(BrandsService.name);

  constructor(
    private readonly repository: BrandsRepository,
    private readonly connect: StripeConnectService,
  ) {}

  async publicList() {
    return this.repository.findAllPublic();
  }

  async list(input: ListBrandsInput) {
    const { items, total } = await this.repository.findMany(input);
    return paginatedResponse(items, total, input.page, input.limit);
  }

  async getById(id: string) {
    const brand = await this.repository.findById(id);
    if (!brand) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Brand not found' });
    }
    return brand;
  }

  async create(input: CreateBrandInput) {
    try {
      const slug = await uniqueSlug(input.name, (value) =>
        this.repository.slugExists(value),
      );

      const brand = await this.repository.create({
        name: input.name,
        slug,
        tagline: input.tagline ?? null,
        logoUrl: input.logoUrl ?? null,
        displayOrder: input.displayOrder,
        active: input.active,
        isPlatform: false,
      });

      if (input.isPlatform) {
        return this.repository.setPlatformBrand(brand.id);
      }
      return brand;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      handlePrismaError(error);
    }
  }

  async update(input: UpdateBrandInput) {
    const { id, isPlatform, ...data } = input;
    const existing = await this.getById(id);

    // Demoting the platform brand would leave the storefront with no account to
    // charge. Promote the replacement instead — that demotes this one.
    if (isPlatform === false && existing.isPlatform) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message:
          'Promote another brand to platform instead — one brand must always own the Stripe account that takes payment',
      });
    }

    try {
      const updateData: Record<string, unknown> = { ...data };
      if (data.name && data.name !== existing.name) {
        updateData.slug = await uniqueSlug(data.name, (value) =>
          this.repository.slugExists(value, id),
        );
      }

      await this.repository.update(id, updateData);

      if (isPlatform === true && !existing.isPlatform) {
        return this.setPlatform(id);
      }
      return this.getById(id);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      handlePrismaError(error);
    }
  }

  /**
   * Makes this brand the merchant of record. Its own connected account is
   * cleared — the platform brand is paid by settling into the platform balance
   * directly, never by transfer.
   */
  async setPlatform(id: string) {
    const brand = await this.getById(id);

    if (brand.stripeAccountId) {
      await this.repository.update(id, {
        stripeAccountId: null,
        chargesEnabled: false,
        payoutsEnabled: false,
        onboardingStatus: 'NOT_STARTED',
        requirementsDue: [],
      });
      this.logger.log(
        `Brand ${id} promoted to platform — cleared its connected account link`,
      );
    }

    return this.repository.setPlatformBrand(id);
  }

  async delete(id: string) {
    const brand = await this.getById(id);

    if (brand.isPlatform) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'The platform brand cannot be deleted',
      });
    }

    const productCount = await this.repository.countProducts(id);
    if (productCount > 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Move or archive this brand's ${productCount} product(s) first`,
      });
    }

    try {
      return await this.repository.softDelete(id);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  /**
   * Creates the connected account if the brand does not have one yet, then
   * returns a fresh Stripe-hosted onboarding link. Links are short-lived, so
   * this is called per click rather than cached.
   */
  async startConnectOnboarding(id: string) {
    const brand = await this.getById(id);

    if (brand.isPlatform) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message:
          'The platform brand is paid directly and does not need a connected account',
      });
    }

    if (!this.connect.isEnabled) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'Payments are not configured',
      });
    }

    try {
      let stripeAccountId = brand.stripeAccountId;

      if (!stripeAccountId) {
        stripeAccountId = await this.connect.createConnectedAccount({
          brandId: brand.id,
          brandName: brand.name,
        });
        await this.repository.update(id, {
          stripeAccountId,
          onboardingStatus: 'IN_PROGRESS',
        });
      }

      const url = await this.connect.createAccountLink(
        stripeAccountId,
        brand.onboardingStatus === 'COMPLETE'
          ? 'account_update'
          : 'account_onboarding',
      );

      return { url, stripeAccountId };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      this.logger.error(
        `Connect onboarding failed for brand ${id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not start Stripe onboarding. Please try again.',
      });
    }
  }

  /** Pulls live status from Stripe and mirrors it onto the brand row. */
  async refreshConnectStatus(id: string) {
    const brand = await this.getById(id);

    if (!brand.stripeAccountId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'This brand has not started Stripe onboarding yet',
      });
    }

    if (!this.connect.isEnabled) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'Payments are not configured',
      });
    }

    try {
      const status = await this.connect.getAccountStatus(brand.stripeAccountId);

      return await this.repository.update(id, {
        chargesEnabled: status.chargesEnabled,
        payoutsEnabled: status.payoutsEnabled,
        requirementsDue: status.requirementsDue,
        onboardingStatus: resolveOnboardingStatus(status),
        stripeSyncedAt: new Date(),
      });
    } catch (error) {
      this.logger.error(
        `Connect status refresh failed for brand ${id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not reach Stripe. Please try again.',
      });
    }
  }
}

function resolveOnboardingStatus(status: {
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirementsDue: string[];
  disabledReason: string | null;
}) {
  if (status.disabledReason) return 'RESTRICTED' as const;
  if (status.payoutsEnabled) return 'COMPLETE' as const;
  if (status.detailsSubmitted) return 'PENDING_VERIFICATION' as const;
  if (status.requirementsDue.length > 0) return 'IN_PROGRESS' as const;
  return 'NOT_STARTED' as const;
}
