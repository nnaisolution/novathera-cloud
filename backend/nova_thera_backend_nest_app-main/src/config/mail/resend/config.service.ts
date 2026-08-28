import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ResendMailConfigService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    const apiKey = process.env.RESEND_API_KEY?.trim();
    const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();

    if (!apiKey || !fromEmail) {
      throw new Error(
        'RESEND_API_KEY and RESEND_FROM_EMAIL must be set in production',
      );
    }
  }

  get apiKey(): string | undefined {
    const apiKey = this.configService.get<string>('mail.resend.apiKey');
    return apiKey?.trim() || undefined;
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  get fromEmail(): string {
    return (
      this.configService.get<string>('mail.resend.fromEmail') ??
      'Nova Thera <onboarding@resend.dev>'
    );
  }

  get testRecipient(): string | undefined {
    return this.configService.get<string>('mail.resend.testRecipient');
  }

  isResendTestSender(): boolean {
    return this.fromEmail.includes('onboarding@resend.dev');
  }

  resolveRecipient(to: string): string {
    if (this.isResendTestSender() && this.testRecipient) {
      return this.testRecipient;
    }

    return to;
  }
}
