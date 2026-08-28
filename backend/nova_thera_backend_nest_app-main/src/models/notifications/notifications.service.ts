import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../providers/database/postgres/prisma.service';
import type { RegisterDeviceInput } from './schemas/notification.schema';

type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  data?: { url: string };
  sound: 'default';
};

function isExpoPushToken(value: string): boolean {
  return /^Expo(nent)?PushToken\[.+\]$/.test(value);
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async registerDevice(userId: string, input: RegisterDeviceInput) {
    return this.prisma.devicePushToken.upsert({
      where: { tokenHash: input.tokenHash },
      create: {
        userId,
        platform: input.platform,
        tokenHash: input.tokenHash,
        expoPushToken: input.expoPushToken ?? null,
      },
      update: {
        userId,
        platform: input.platform,
        lastSeenAt: new Date(),
        revokedAt: null,
        ...(input.expoPushToken ? { expoPushToken: input.expoPushToken } : {}),
      },
    });
  }

  /**
   * Best-effort remote push. Sends only when EXPO_ACCESS_TOKEN is set and a
   * live Expo token was registered. FCM_SERVER_KEY is treated as the same
   * gate for “a send path exists” but Expo tokens still go through Expo’s API.
   */
  async notifyUser(
    userId: string,
    payload: { title: string; body: string; url?: string },
  ): Promise<void> {
    const expoAccessToken = this.config.get<string>('EXPO_ACCESS_TOKEN')?.trim();
    const fcmServerKey = this.config.get<string>('FCM_SERVER_KEY')?.trim();
    if (!expoAccessToken && !fcmServerKey) {
      return;
    }

    const rows = await this.prisma.devicePushToken.findMany({
      where: { userId, revokedAt: null },
      select: { expoPushToken: true, tokenHash: true },
    });

    const destinations = new Set<string>();
    for (const row of rows) {
      if (row.expoPushToken && isExpoPushToken(row.expoPushToken)) {
        destinations.add(row.expoPushToken);
      } else if (isExpoPushToken(row.tokenHash)) {
        destinations.add(row.tokenHash);
      }
    }

    if (destinations.size === 0) {
      this.logger.log(
        `push_skipped_no_live_token user=${userId} devices=${rows.length} title=${payload.title}`,
      );
      return;
    }

    if (!expoAccessToken) {
      this.logger.log(
        `push_skipped_expo_token_missing user=${userId} devices=${destinations.size}`,
      );
      return;
    }

    const messages: ExpoPushMessage[] = [...destinations].map((to) => ({
      to,
      title: payload.title,
      body: payload.body,
      sound: 'default',
      ...(payload.url ? { data: { url: payload.url } } : {}),
    }));

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${expoAccessToken}`,
        },
        body: JSON.stringify(messages),
      });
      if (!response.ok) {
        this.logger.warn(`expo_push_http_${response.status} user=${userId}`);
      }
    } catch (error: unknown) {
      const detail = error instanceof Error ? error.message : 'unknown';
      this.logger.warn(`expo_push_failed user=${userId} detail=${detail}`);
    }
  }

  notifyVisitBooked(userId: string, bookingId: string): void {
    void this.notifyUser(userId, {
      title: 'Visit booked',
      body: 'Your clinic visit is confirmed. Open Nova Thera for the time and location.',
      url: `novathera://care/appointments/${bookingId}`,
    });
  }
}
