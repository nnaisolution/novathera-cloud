import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin, bearer } from 'better-auth/plugins';
import { stripe } from '@better-auth/stripe';
import Stripe from 'stripe';
import { PrismaClient } from 'generated/prisma/client';
import { AuthConfigService } from '../config/auth/config.service';
import { StripeConfigService } from '../config/stripe/config.service';
import { MailService } from '../providers/mail/resend/mail.service';
import { StripeWebhookService } from '../providers/payments/stripe/stripe-webhook.service';
import {
  MEMBERSHIP_PLAN_CATALOG,
  MEMBERSHIP_PLAN_IDS,
} from '../models/membership/membership-plans';
import { ac, roles } from './permissions';
import { signupRolePlugin } from './signup-role.plugin';

export type AuthInstance = ReturnType<typeof createAuth>;

/** Security settings, read from the database at boot. */
export type AuthSecurityOptions = {
  sessionExpiresInDays: number;
  sessionUpdateAgeHours: number;
  freshAgeMinutes: number;
  signInMaxAttempts: number;
  signInWindowSeconds: number;
  rateLimitStorage: 'memory' | 'database';
  requireEmailVerification: boolean;
};

export type AuthAuditEvent = {
  action: string;
  summary: string;
  actorUserId?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type AuthRuntimeOptions = {
  security?: AuthSecurityOptions;
  /** Invoked for security-relevant database events; must never throw. */
  onAuditEvent?: (event: AuthAuditEvent) => void | Promise<void>;
};

function buildSocialProviders(authConfig: AuthConfigService) {
  const socialProviders: NonNullable<
    Parameters<typeof betterAuth>[0]['socialProviders']
  > = {};

  if (authConfig.googleClientId && authConfig.googleClientSecret) {
    socialProviders.google = {
      clientId: authConfig.googleClientId,
      clientSecret: authConfig.googleClientSecret,
    };
  }

  if (authConfig.appleClientId && authConfig.appleClientSecret) {
    socialProviders.apple = {
      clientId: authConfig.appleClientId,
      clientSecret: authConfig.appleClientSecret,
    };
  }

  if (authConfig.facebookClientId && authConfig.facebookClientSecret) {
    socialProviders.facebook = {
      clientId: authConfig.facebookClientId,
      clientSecret: authConfig.facebookClientSecret,
    };
  }

  return socialProviders;
}

export function createAuth(
  authConfig: AuthConfigService,
  prisma: PrismaClient,
  mailService: MailService,
  stripeConfig: StripeConfigService,
  stripeWebhookService: StripeWebhookService,
  runtime: AuthRuntimeOptions = {},
) {
  const ipAddressHeaders = authConfig.ipAddressHeaders;
  const socialProviders = buildSocialProviders(authConfig);
  const security = runtime.security;
  const audit = runtime.onAuditEvent;

  /** Request metadata for an audit entry, when a hook has request context. */
  const requestMeta = (
    ctx?: { request?: Request; headers?: Headers } | null,
  ) => {
    const headers = ctx?.headers ?? ctx?.request?.headers;
    return {
      ipAddress:
        headers?.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        headers?.get('x-real-ip') ??
        null,
      userAgent: headers?.get('user-agent') ?? null,
    };
  };

  const stripePlugins =
    stripeConfig.secretKey && stripeConfig.webhookSecret
      ? [
          stripe({
            // CJS/ESM Stripe type mismatch between better-auth and stripe packages
            stripeClient: new Stripe(stripeConfig.secretKey) as never,
            stripeWebhookSecret: stripeConfig.webhookSecret,
            createCustomerOnSignUp: true,
            onEvent: async (event) => {
              await stripeWebhookService.handleEvent(event as never);
            },
            subscription: {
              enabled: true,
              plans: MEMBERSHIP_PLAN_IDS.map((id) => ({
                name: MEMBERSHIP_PLAN_CATALOG[id].name,
                priceId: stripeConfig.membershipPriceIds[id] || undefined,
              })),
            },
          }),
        ]
      : [];

  return betterAuth({
    appName: authConfig.appName,
    baseURL: authConfig.baseUrl,
    secret: authConfig.secret,
    trustedOrigins: authConfig.trustedOrigins,
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    user: {
      additionalFields: {
        phoneNumber: {
          type: 'string',
          required: false,
        },
        marketingOptIn: {
          type: 'boolean',
          required: false,
          defaultValue: false,
        },
        firstName: {
          type: 'string',
          required: false,
        },
        lastName: {
          type: 'string',
          required: false,
        },
        dateOfBirth: {
          type: 'date',
          required: false,
        },
        addressLine1: {
          type: 'string',
          required: false,
        },
        addressLine2: {
          type: 'string',
          required: false,
        },
        city: {
          type: 'string',
          required: false,
        },
        province: {
          type: 'string',
          required: false,
        },
        postalCode: {
          type: 'string',
          required: false,
        },
        country: {
          type: 'string',
          required: false,
        },
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        await mailService.sendVerificationEmail({ to: user.email, url });
      },
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      expiresIn: 3600,
    },
    session: {
      expiresIn: (security?.sessionExpiresInDays ?? 7) * 24 * 60 * 60,
      updateAge: (security?.sessionUpdateAgeHours ?? 24) * 60 * 60,
      freshAge: (security?.freshAgeMinutes ?? 60) * 60,
    },
    rateLimit: {
      enabled: true,
      storage: security?.rateLimitStorage ?? 'database',
      // Sign-in and sign-up are the endpoints worth tightening; the rest keep
      // Better Auth's defaults.
      customRules: {
        '/sign-in/email': {
          window: security?.signInWindowSeconds ?? 60,
          max: security?.signInMaxAttempts ?? 5,
        },
        '/sign-up/email': {
          window: security?.signInWindowSeconds ?? 60,
          max: Math.max(1, Math.floor((security?.signInMaxAttempts ?? 5) / 2)),
        },
      },
    },
    databaseHooks: {
      session: {
        create: {
          after: async (session, ctx) => {
            const impersonated = Boolean(
              (session as { impersonatedBy?: string | null }).impersonatedBy,
            );
            await audit?.({
              action: impersonated
                ? 'auth.impersonation_started'
                : 'auth.signed_in',
              actorUserId: impersonated
                ? ((session as { impersonatedBy?: string }).impersonatedBy ??
                  null)
                : session.userId,
              targetType: 'user',
              targetId: session.userId,
              summary: impersonated
                ? `Started impersonating user ${session.userId}`
                : 'Signed in',
              ...requestMeta(ctx),
            });
          },
        },
        delete: {
          after: async (session, ctx) => {
            const impersonated = Boolean(
              (session as { impersonatedBy?: string | null }).impersonatedBy,
            );
            // Only impersonation ends are worth a row; ordinary sign-outs and
            // expiry sweeps would drown the trail.
            if (!impersonated) return;
            await audit?.({
              action: 'auth.impersonation_stopped',
              actorUserId:
                (session as { impersonatedBy?: string }).impersonatedBy ?? null,
              targetType: 'user',
              targetId: session.userId,
              summary: `Stopped impersonating user ${session.userId}`,
              ...requestMeta(ctx),
            });
          },
        },
      },
      user: {
        update: {
          after: async (user, ctx) => {
            await audit?.({
              action: 'user.email_changed',
              actorUserId: user.id,
              targetType: 'user',
              targetId: user.id,
              summary: `Account record updated for ${user.email}`,
              metadata: { email: user.email },
              ...requestMeta(ctx),
            });
          },
        },
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification:
        security?.requireEmailVerification ??
        authConfig.requireEmailVerification,
      autoSignIn: false,
      sendResetPassword: async ({ user, url }) => {
        await mailService.sendResetPassword({ to: user.email, url });
      },
      customSyntheticUser: ({ coreFields, additionalFields, id }) => ({
        ...coreFields,
        role: 'customer',
        banned: false,
        banReason: null,
        banExpires: null,
        ...additionalFields,
        id,
      }),
    },
    ...(Object.keys(socialProviders).length > 0 ? { socialProviders } : {}),
    plugins: [
      signupRolePlugin(),
      admin({
        ac,
        roles,
        defaultRole: 'customer',
      }),
      // The mobile app has no cookie jar. With this, any caller may present the
      // session token as `Authorization: Bearer <token>`, which the tRPC context
      // already forwards to getSession — so the whole router works unchanged.
      bearer(),
      ...stripePlugins,
    ],
    experimental: {
      joins: true,
    },
    advanced: {
      trustedProxyHeaders: authConfig.trustedProxyHeaders,
      // The API, storefront and admin app are separate origins in production.
      // Without this the session cookie defaults to SameSite=Lax and is simply
      // not sent on cross-site XHR, so every deployed login appears to succeed
      // and then immediately behaves as signed out.
      //
      // Sharing a parent domain (api./admin./www.novathera.ca) keeps the cookie
      // first-party, which SameSite=Lax allows and which survives browsers
      // phasing out third-party cookies.
      ...(authConfig.cookieDomain
        ? {
            crossSubDomainCookies: {
              enabled: true,
              domain: authConfig.cookieDomain,
            },
          }
        : {}),
      useSecureCookies: authConfig.isSecureContext,
      ...(ipAddressHeaders.length > 0
        ? {
            ipAddress: {
              ipAddressHeaders,
            },
          }
        : {}),
    },
  });
}
