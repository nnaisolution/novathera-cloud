import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { AuthConfigService } from '../../../config/auth/config.service';
import { ResendMailConfigService } from '../../../config/mail/resend/config.service';
import { getEmailVerificationContent } from '../../../mails/email-verification/content';
import { getOrderConfirmationContent } from '../../../mails/order-confirmation/content';
import { getPasswordResetContent } from '../../../mails/password-reset/content';
import { getShippingNotificationContent } from '../../../mails/shipping-notification/content';

type OrderMailPayload = {
  orderCode: string;
  totalCents: number;
  currency: string;
  trackingNumber?: string | null;
  items: Array<{
    name: string;
    quantity: number;
    unitPriceCents: number;
  }>;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;

  constructor(
    private readonly mailConfig: ResendMailConfigService,
    private readonly authConfig: AuthConfigService,
  ) {
    this.resend = this.mailConfig.apiKey
      ? new Resend(this.mailConfig.apiKey)
      : null;

    if (!this.resend) {
      this.logger.warn(
        'RESEND_API_KEY is not set — verification emails will be logged to the console only',
      );
    }
  }

  async sendVerificationEmail({
    to,
    url,
  }: {
    to: string;
    url: string;
  }): Promise<void> {
    const recipient = this.mailConfig.resolveRecipient(to);

    if (!this.resend) {
      this.logger.log(`[dev] Verification email for ${to}: ${url}`);
      return;
    }

    if (recipient !== to) {
      this.logger.log(
        `[dev] Resend test sender — delivering verification for ${to} to ${recipient}`,
      );
    }

    const { subject, text, html } = getEmailVerificationContent({
      appName: this.authConfig.appName,
      url,
      intendedFor: recipient !== to ? to : undefined,
    });

    try {
      const result = await this.resend.emails.send({
        from: this.mailConfig.fromEmail,
        to: recipient,
        subject,
        text,
        html,
      });

      if (result.error) {
        this.logger.error(
          `Failed to send verification email to ${to}: ${result.error.message}`,
        );
      }
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send verification email to ${to}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async sendResetPassword({
    to,
    url,
  }: {
    to: string;
    url: string;
  }): Promise<void> {
    const recipient = this.mailConfig.resolveRecipient(to);

    if (!this.resend) {
      this.logger.log(`[dev] Password reset email for ${to}: ${url}`);
      return;
    }

    if (recipient !== to) {
      this.logger.log(
        `[dev] Resend test sender — delivering password reset for ${to} to ${recipient}`,
      );
    }

    const { subject, text, html } = getPasswordResetContent({
      appName: this.authConfig.appName,
      url,
      intendedFor: recipient !== to ? to : undefined,
    });

    try {
      const result = await this.resend.emails.send({
        from: this.mailConfig.fromEmail,
        to: recipient,
        subject,
        text,
        html,
      });

      if (result.error) {
        this.logger.error(
          `Failed to send password reset email to ${to}: ${result.error.message}`,
        );
      }
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send password reset email to ${to}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async sendOrderConfirmationEmail({
    to,
    order,
  }: {
    to: string;
    order: OrderMailPayload;
  }): Promise<void> {
    const recipient = this.mailConfig.resolveRecipient(to);
    const { subject, text, html } = getOrderConfirmationContent({
      appName: this.authConfig.appName,
      orderCode: order.orderCode,
      totalCents: order.totalCents,
      currency: order.currency,
      items: order.items,
      intendedFor: recipient !== to ? to : undefined,
    });

    if (!this.resend) {
      this.logger.log(
        `[dev] Order confirmation for ${to} (${order.orderCode}): ${subject}`,
      );
      return;
    }

    try {
      const result = await this.resend.emails.send({
        from: this.mailConfig.fromEmail,
        to: recipient,
        subject,
        text,
        html,
      });

      if (result.error) {
        this.logger.error(
          `Failed to send order confirmation to ${to}: ${result.error.message}`,
        );
      }
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send order confirmation to ${to}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async sendShippingNotificationEmail({
    to,
    order,
  }: {
    to: string;
    order: OrderMailPayload;
  }): Promise<void> {
    const trackingNumber = order.trackingNumber?.trim();
    if (!trackingNumber) {
      this.logger.warn(
        `Skipping shipping notification for ${order.orderCode}: missing tracking number`,
      );
      return;
    }

    const recipient = this.mailConfig.resolveRecipient(to);
    const { subject, text, html } = getShippingNotificationContent({
      appName: this.authConfig.appName,
      orderCode: order.orderCode,
      trackingNumber,
      intendedFor: recipient !== to ? to : undefined,
    });

    if (!this.resend) {
      this.logger.log(
        `[dev] Shipping notification for ${to} (${order.orderCode}): tracking ${trackingNumber}`,
      );
      return;
    }

    try {
      const result = await this.resend.emails.send({
        from: this.mailConfig.fromEmail,
        to: recipient,
        subject,
        text,
        html,
      });

      if (result.error) {
        this.logger.error(
          `Failed to send shipping notification to ${to}: ${result.error.message}`,
        );
      }
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send shipping notification to ${to}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
