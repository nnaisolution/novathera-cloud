import { Module } from '@nestjs/common';
import { FamilyMembersRepository } from './family-members.repository';
import { FamilyMembersService } from './family-members.service';

@Module({
  providers: [FamilyMembersRepository, FamilyMembersService],
  exports: [FamilyMembersService],
})
export class FamilyMembersModule {}
