import { Module } from '@nestjs/common';
import { MembershipRepository } from './membership.repository';
import { MembershipService } from './membership.service';

@Module({
  providers: [MembershipRepository, MembershipService],
  exports: [MembershipService],
})
export class MembershipModule {}
