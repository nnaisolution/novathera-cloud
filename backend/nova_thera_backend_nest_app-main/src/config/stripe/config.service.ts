import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeConfigService {
  constructor(private readonly configService: ConfigService) {}

  get secretKey(): string {
    return this.configService.get<string>('stripe.secretKey', '');
  }

  get webhookSecret(): string {
    return this.configService.get<string>('stripe.webhookSecret', '');
  }

  get successUrlBooking(): string {
    return this.configService.getOrThrow<string>('stripe.successUrlBooking');
  }

  get successUrlShop(): string {
    return this.configService.getOrThrow<string>('stripe.successUrlShop');
  }

  get cancelUrlShop(): string {
    return this.configService.getOrThrow<string>('stripe.cancelUrlShop');
  }

  get automaticTaxEnabled(): boolean {
    return this.configService.get<boolean>('stripe.automaticTaxEnabled', true);
  }

  get membershipPriceIds(): Record<'essential' | 'enhanced' | 'elite', string> {
    return this.configService.get('stripe.membershipPriceIds', {
      essential: '',
      enhanced: '',
      elite: '',
    });
  }

  get membershipSuccessUrl(): string {
    return this.configService.getOrThrow<string>('stripe.membershipSuccessUrl');
  }

  get membershipCancelUrl(): string {
    return this.configService.getOrThrow<string>('stripe.membershipCancelUrl');
  }

  get membershipPortalReturnUrl(): string {
    return this.configService.getOrThrow<string>(
      'stripe.membershipPortalReturnUrl',
    );
  }

  get connectCountry(): string {
    return this.configService.get<string>('stripe.connectCountry', 'CA');
  }

  get connectRefreshUrl(): string {
    return this.configService.getOrThrow<string>('stripe.connectRefreshUrl');
  }

  get connectReturnUrl(): string {
    return this.configService.getOrThrow<string>('stripe.connectReturnUrl');
  }

  get isConfigured(): boolean {
    return Boolean(this.secretKey);
  }

  /**
   * True when running against test/sandbox keys. Stamped onto orders and
   * bookings so test traffic on a production deploy is excluded from revenue
   * reporting instead of silently inflating it.
   */
  get isTestMode(): boolean {
    return !this.secretKey.startsWith('sk_live_');
  }
}
