import { Injectable, Logger } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { paginatedResponse } from '../../common/schemas/pagination.schema';
import { handlePrismaError } from '../../common/helpers/prisma-errors';
import { MailService } from '../../providers/mail/resend/mail.service';
import { BrandPayoutService } from '../../providers/payments/stripe/brand-payout.service';
import { OrdersRepository } from './orders.repository';
import type {
  ListMyOrdersInput,
  ListOrdersInput,
  SetFulfillmentStatusInput,
} from './schemas/order.schema';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly repository: OrdersRepository,
    private readonly mailService: MailService,
    private readonly payouts: BrandPayoutService,
  ) {}

  async myList(userId: string, input: ListMyOrdersInput) {
    const { items, total } = await this.repository.findManyForCustomer(
      userId,
      input,
    );
    return paginatedResponse(items, total, input.page, input.limit);
  }

  async myGetById(id: string, userId: string) {
    const order = await this.repository.findByIdForCustomer(id, userId);
    if (!order) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
    }
    return order;
  }

  async myGetBySessionId(sessionId: string, userId: string) {
    const order = await this.repository.findBySessionIdForCustomer(
      sessionId,
      userId,
    );
    if (!order) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
    }
    return order;
  }

  async list(input: ListOrdersInput) {
    const { items, total } = await this.repository.findMany(input);
    return paginatedResponse(items, total, input.page, input.limit);
  }

  async getById(id: string) {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
    }
    return order;
  }

  async setFulfillmentStatus(input: SetFulfillmentStatusInput) {
    const existing = await this.getById(input.id);
    if (existing.status !== 'PAID' && existing.status !== 'FULFILLED') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Only paid or fulfilled orders can be updated',
      });
    }

    try {
      const order = await this.repository.setFulfillmentStatus(input);

      if (input.status === 'SHIPPED' && order.user.email) {
        try {
          await this.mailService.sendShippingNotificationEmail({
            to: order.user.email,
            order,
          });
        } catch (error) {
          this.logger.warn(
            `Failed to send shipping notification for order ${order.id}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }

      return order;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      handlePrismaError(error);
    }
  }

  /**
   * Pays out any brand share on this order that is still outstanding — a
   * transfer that failed, or one parked because the brand had not finished
   * Connect onboarding when the order was placed.
   */
  async retryBrandTransfers(id: string) {
    await this.getById(id);
    await this.payouts.settleOrderTransfers(id);
    return this.getById(id);
  }
}
