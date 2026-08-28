import { Module } from '@nestjs/common';
import { StripeConfigModule } from '../../config/stripe/config.module';
import { FamilyMembersModule } from '../family-members/family-members.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { BookingsRepository } from './bookings.repository';
import { BookingsService } from './bookings.service';

@Module({
  imports: [StripeConfigModule, FamilyMembersModule, NotificationsModule],
  providers: [BookingsRepository, BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
