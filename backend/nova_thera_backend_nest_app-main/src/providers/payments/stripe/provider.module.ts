import { Global, Module } from '@nestjs/common';
import { StripeConfigModule } from '../../../config/stripe/config.module';
import { PostgresProviderModule } from '../../database/postgres/provider.module';
import { ResendMailProviderModule } from '../../mail/resend/provider.module';
import { BrandPayoutService } from './brand-payout.service';
import { StripeCatalogService } from './stripe-catalog.service';
import { StripeConnectService } from './stripe-connect.service';
import { StripeWebhookService } from './stripe-webhook.service';

@Global()
@Module({
  imports: [
    StripeConfigModule,
    PostgresProviderModule,
    ResendMailProviderModule,
  ],
  providers: [
    StripeCatalogService,
    StripeConnectService,
    BrandPayoutService,
    StripeWebhookService,
  ],
  exports: [
    StripeCatalogService,
    StripeConnectService,
    BrandPayoutService,
    StripeWebhookService,
  ],
})
export class StripeProviderModule {}
