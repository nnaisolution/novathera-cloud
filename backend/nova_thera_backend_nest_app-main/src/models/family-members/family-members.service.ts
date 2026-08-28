import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { FamilyMembersRepository } from './family-members.repository';
import type {
  CreateFamilyMemberInput,
  UpdateFamilyMemberInput,
} from './schemas/family-member.schema';

@Injectable()
export class FamilyMembersService {
  constructor(private readonly repository: FamilyMembersRepository) {}

  async listForOwner(ownerUserId: string) {
    const members = await this.repository.findManyForOwner(ownerUserId);
    return Promise.all(
      members.map(async (member) => ({
        ...member,
        visitsThisYear: await this.repository.countVisitsThisYear(member.id),
      })),
    );
  }

  async createForOwner(ownerUserId: string, input: CreateFamilyMemberInput) {
    return this.repository.create(ownerUserId, input);
  }

  async updateForOwner(
    ownerUserId: string,
    input: UpdateFamilyMemberInput,
  ) {
    const existing = await this.repository.findByIdForOwner(
      input.id,
      ownerUserId,
    );
    if (!existing) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Family member not found',
      });
    }
    const { id, ...data } = input;
    return this.repository.update(id, data);
  }

  async deleteForOwner(ownerUserId: string, id: string) {
    const existing = await this.repository.findByIdForOwner(id, ownerUserId);
    if (!existing) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Family member not found',
      });
    }
    return this.repository.softDelete(id);
  }

  /** Throws NOT_FOUND unless `id` is an active family member owned by `ownerUserId`. */
  async assertOwnedByUser(id: string, ownerUserId: string) {
    const existing = await this.repository.findByIdForOwner(id, ownerUserId);
    if (!existing) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Family member not found',
      });
    }
  }
}
