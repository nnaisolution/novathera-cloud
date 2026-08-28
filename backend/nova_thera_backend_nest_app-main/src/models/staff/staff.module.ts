import { Module } from '@nestjs/common';
import { AuthConfigModule } from '../../config/auth/config.module';
import { AuditModule } from '../audit/audit.module';
import { SettingsModule } from '../settings/settings.module';
import { StaffRepository } from './staff.repository';
import { StaffService } from './staff.service';

@Module({
  imports: [AuditModule, AuthConfigModule, SettingsModule],
  providers: [StaffRepository, StaffService],
  exports: [StaffService],
})
export class StaffModule {}
