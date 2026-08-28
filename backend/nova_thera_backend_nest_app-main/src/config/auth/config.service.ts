import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthConfigService {
  constructor(private readonly configService: ConfigService) {}

  get appName(): string {
    return this.configService.getOrThrow<string>('auth.appName');
  }

  get secret(): string {
    return this.configService.getOrThrow<string>('auth.secret');
  }

  get baseUrl(): string {
    return this.configService.getOrThrow<string>('auth.baseUrl');
  }

  get trustedOrigins(): string[] {
    return this.configService.get<string[]>('auth.trustedOrigins', []);
  }

  get requireEmailVerification(): boolean {
    return this.configService.get<boolean>(
      'auth.requireEmailVerification',
      true,
    );
  }

  get trustedProxyHeaders(): boolean {
    return this.configService.get<boolean>('auth.trustedProxyHeaders', false);
  }

  get ipAddressHeaders(): string[] {
    return this.configService.get<string[]>('auth.ipAddressHeaders', []);
  }

  get adminAppUrl(): string {
    return this.configService.get<string>(
      'auth.adminAppUrl',
      'http://localhost:3001',
    );
  }

  /**
   * See the warning in configuration.ts — this permits anyone reaching the
   * admin app's /register page to create a full admin account.
   */
  get adminSelfSignupEnabled(): boolean {
    return this.configService.get<boolean>('auth.adminSelfSignupEnabled', true);
  }

  /** Parent domain (".example.com") for cross-subdomain session cookies. */
  get cookieDomain(): string {
    return this.configService.get<string>('auth.cookieDomain', '');
  }

  /** True once the API is served over HTTPS, which production always is. */
  get isSecureContext(): boolean {
    return this.baseUrl.startsWith('https://');
  }

  get googleClientId(): string {
    return this.configService.get<string>('auth.googleClientId', '');
  }

  get googleClientSecret(): string {
    return this.configService.get<string>('auth.googleClientSecret', '');
  }

  get appleClientId(): string {
    return this.configService.get<string>('auth.appleClientId', '');
  }

  get appleClientSecret(): string {
    return this.configService.get<string>('auth.appleClientSecret', '');
  }

  get facebookClientId(): string {
    return this.configService.get<string>('auth.facebookClientId', '');
  }

  get facebookClientSecret(): string {
    return this.configService.get<string>('auth.facebookClientSecret', '');
  }

  /**
   * HS256 secret the patient API signs mobile link tokens with. Empty means the
   * exchange endpoint is not configured and must refuse to run.
   */
  get mobileLinkSecret(): string {
    return this.configService.get<string>('auth.mobileLinkSecret', '');
  }
}
