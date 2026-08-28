import { Injectable, Logger } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { paginatedResponse } from '../../common/schemas/pagination.schema';
import { handlePrismaError } from '../../common/helpers/prisma-errors';
import { StripeCatalogService } from '../../providers/payments/stripe/stripe-catalog.service';
import { DiscountsRepository } from './discounts.repository';
import type {
  CreateDiscountInput,
  ListDiscountsInput,
} from './schemas/discount.schema';

@Injectable()
export class DiscountsService {
  private readonly logger = new Logger(DiscountsService.name);

  constructor(
    private readonly repository: DiscountsRepository,
    private readonly stripeCatalog: StripeCatalogService,
  ) {}

  async list(input: ListDiscountsInput) {
    const { items, total } = await this.repository.findMany(input);
    return paginatedResponse(items, total, input.page, input.limit);
  }

  async getById(id: string) {
    const discount = await this.repository.findById(id);
    if (!discount) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Discount not found' });
    }
    return discount;
  }

  async create(input: CreateDiscountInput) {
    const stripe = this.stripeCatalog.stripe;
    let stripeCouponId: string | null = null;
    let stripePromotionCodeId: string | null = null;

    if (stripe) {
      try {
        const coupon = await stripe.coupons.create({
          ...(input.type === 'PERCENT'
            ? { percent_off: input.percentOff! }
            : {
                amount_off: input.amountOffCents!,
                currency: 'cad',
              }),
          duration: 'once',
          name: input.code,
          ...(input.expiresAt
            ? {
                redeem_by: Math.floor(input.expiresAt.getTime() / 1000),
              }
            : {}),
        });
        stripeCouponId = coupon.id;

        const promotionCode = await stripe.promotionCodes.create({
          promotion: {
            type: 'coupon',
            coupon: coupon.id,
          },
          code: input.code,
          ...(input.expiresAt
            ? {
                expires_at: Math.floor(input.expiresAt.getTime() / 1000),
              }
            : {}),
        });
        stripePromotionCodeId = promotionCode.id;
      } catch (error) {
        this.logger.warn(
          `Stripe coupon creation failed for ${input.code}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to create Stripe promotion code',
        });
      }
    }

    try {
      return await this.repository.create({
        ...input,
        stripeCouponId,
        stripePromotionCodeId,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async deactivate(id: string) {
    const discount = await this.getById(id);
    const stripe = this.stripeCatalog.stripe;

    if (stripe && discount.stripePromotionCodeId) {
      try {
        await stripe.promotionCodes.update(discount.stripePromotionCodeId, {
          active: false,
        });
      } catch (error) {
        this.logger.warn(
          `Failed to deactivate Stripe promotion code ${discount.stripePromotionCodeId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    try {
      return await this.repository.deactivate(id);
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
