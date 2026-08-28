import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { AuthConfigModule } from '../config/auth/config.module';
import { AuthConfigService } from '../config/auth/config.service';
import { StripeConfigModule } from '../config/stripe/config.module';
import { StripeConfigService } from '../config/stripe/config.service';
import { PrismaService } from '../providers/database/postgres/prisma.service';
import { PostgresProviderModule } from '../providers/database/postgres/provider.module';
import { ResendMailProviderModule } from '../providers/mail/resend/provider.module';
import { MailService } from '../providers/mail/resend/mail.service';
import { StripeProviderModule } from '../providers/payments/stripe/provider.module';
import { StripeWebhookService } from '../providers/payments/stripe/stripe-webhook.service';
import { AuditModule } from '../models/audit/audit.module';
import { AuditService } from '../models/audit/audit.service';
import { SettingsModule } from '../models/settings/settings.module';
import { SettingsService } from '../models/settings/settings.service';
import { createAuth } from './auth.factory';
import { UsersController } from './users.controller';

@Module({
  imports: [
    AuthModule.forRootAsync({
      isGlobal: true,
      imports: [
        AuthConfigModule,
        PostgresProviderModule,
        ResendMailProviderModule,
        StripeConfigModule,
        StripeProviderModule,
        SettingsModule,
        AuditModule,
      ],
      inject: [
        AuthConfigService,
        PrismaService,
        MailService,
        StripeConfigService,
        StripeWebhookService,
        SettingsService,
        AuditService,
      ],
      // Async so the stored security settings can be read before the auth
      // instance is built. Better Auth resolves these once at construction,
      // so changing them requires an API restart — the settings UI says so.
      useFactory: async (
        authConfig: AuthConfigService,
        prisma: PrismaService,
        mailService: MailService,
        stripeConfig: StripeConfigService,
        stripeWebhookService: StripeWebhookService,
        settingsService: SettingsService,
        auditService: AuditService,
      ) => ({
        auth: createAuth(
          authConfig,
          prisma,
          mailService,
          stripeConfig,
          stripeWebhookService,
          {
            security: await settingsService.get('security'),
            onAuditEvent: (event) => auditService.record(event),
          },
        ),
        bodyParser: {
          json: { limit: '2mb' },
          urlencoded: { enabled: true, extended: true, limit: '2mb' },
        },
      }),
    }),
  ],
  controllers: [UsersController],
})
export class AuthenticationModule {}
