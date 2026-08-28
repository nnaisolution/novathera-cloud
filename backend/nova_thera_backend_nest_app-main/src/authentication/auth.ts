import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';
import { Pool } from 'pg';
import { AuthConfigService } from '../config/auth/config.service';
import { StripeConfigService } from '../config/stripe/config.service';
import { MailService } from '../providers/mail/resend/mail.service';
import { StripeWebhookService } from '../providers/payments/stripe/stripe-webhook.service';
import { createAuth } from './auth.factory';

/**
 * CLI entry used by `pnpm auth:generate`.
 * Builds the same auth config as Nest via createAuth, driven by env (no hardcoded DB URL).
 */
function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required for auth CLI`);
  }
  return value;
}

function createCliAuthConfig(): AuthConfigService {
  const trustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const ipAddressHeaders = (process.env.BETTER_AUTH_IP_ADDRESS_HEADERS ?? '')
    .split(',')
    .map((header) => header.trim())
    .filter(Boolean);

  return {
    get appName() {
      return process.env.APP_NAME ?? 'Nova Thera';
    },
    get secret() {
      return requireEnv('BETTER_AUTH_SECRET');
    },
    get baseUrl() {
      return requireEnv('BETTER_AUTH_URL');
    },
    get trustedOrigins() {
      return trustedOrigins;
    },
    get requireEmailVerification() {
      return process.env.BETTER_AUTH_REQUIRE_EMAIL_VERIFICATION !== 'false';
    },
    get trustedProxyHeaders() {
      return process.env.BETTER_AUTH_TRUSTED_PROXY_HEADERS === 'true';
    },
    get ipAddressHeaders() {
      return ipAddressHeaders;
    },
    get adminAppUrl() {
      return process.env.BETTER_AUTH_ADMIN_APP_URL ?? 'http://localhost:3001';
    },
    get googleClientId() {
      return process.env.GOOGLE_CLIENT_ID ?? '';
    },
    get googleClientSecret() {
      return process.env.GOOGLE_CLIENT_SECRET ?? '';
    },
    get appleClientId() {
      return process.env.APPLE_CLIENT_ID ?? '';
    },
    get appleClientSecret() {
      return process.env.APPLE_CLIENT_SECRET ?? '';
    },
    get facebookClientId() {
      return process.env.FACEBOOK_CLIENT_ID ?? '';
    },
    get facebookClientSecret() {
      return process.env.FACEBOOK_CLIENT_SECRET ?? '';
    },
  } as AuthConfigService;
}

function createCliMailService(): MailService {
  return {
    sendVerificationEmail: () => Promise.resolve(undefined),
    sendResetPassword: () => Promise.resolve(undefined),
    sendOrderConfirmationEmail: () => Promise.resolve(undefined),
    sendShippingNotificationEmail: () => Promise.resolve(undefined),
  } as unknown as MailService;
}

function createCliStripeConfig(): StripeConfigService {
  const config = {
    get secretKey() {
      return process.env.STRIPE_SECRET_KEY ?? '';
    },
    get webhookSecret() {
      return process.env.STRIPE_WEBHOOK_SECRET ?? '';
    },
    get successUrlBooking() {
      return (
        process.env.STRIPE_SUCCESS_URL_BOOKING ??
        'http://localhost:3000/book/confirmation?session_id={CHECKOUT_SESSION_ID}'
      );
    },
    get successUrlShop() {
      return (
        process.env.STRIPE_SUCCESS_URL_SHOP ??
        'http://localhost:3000/shop/checkout/success?session_id={CHECKOUT_SESSION_ID}'
      );
    },
    get cancelUrlShop() {
      return (
        process.env.STRIPE_CANCEL_URL_SHOP ?? 'http://localhost:3000/shop/cart'
      );
    },
    get isConfigured() {
      return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
    },
  };
  return config as unknown as StripeConfigService;
}

function createCliStripeWebhookService(): StripeWebhookService {
  return {
    handleEvent: () => Promise.resolve(undefined),
  } as unknown as StripeWebhookService;
}

const databaseUrl = requireEnv('DATABASE_URL');
const pool = new Pool({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export const auth = createAuth(
  createCliAuthConfig(),
  prisma,
  createCliMailService(),
  createCliStripeConfig(),
  createCliStripeWebhookService(),
);
