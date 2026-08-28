import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { MobileModule } from './mobile/mobile.module';
import { PostgresProviderModule } from './providers/database/postgres/provider.module';
import { ResendMailProviderModule } from './providers/mail/resend/provider.module';
import { StripeProviderModule } from './providers/payments/stripe/provider.module';
import { GcsStorageProviderModule } from './providers/storage/gcs/provider.module';
import { TrpcModule } from './trpc/trpc.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 120,
      },
      {
        name: 'strict',
        ttl: 60_000,
        limit: 30,
      },
    ]),
    PostgresProviderModule,
    ResendMailProviderModule,
    StripeProviderModule,
    GcsStorageProviderModule,
    AuthenticationModule,
    MobileModule,
    TrpcModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
