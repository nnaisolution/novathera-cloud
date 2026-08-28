"use client";

import { useFamilyMembers } from "../hooks/use-family-members";
import { AddFamilyMemberDialog } from "./add-family-member-dialog";
import { FamilyMemberCard } from "./family-member-card";

export function FamilyMembersView() {
  const { data, isLoading } = useFamilyMembers();

  return (
    <div className="flex w-full flex-col items-start gap-10">
      <div className="flex w-full flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col items-start gap-2.5">
          <h1 className="font-serif text-[40px] leading-none text-[#185b50]">
            Family Members
          </h1>
          <p className="text-base text-[#546256]">
            Shared under your Ritual membership
          </p>
        </div>

        <AddFamilyMemberDialog />
      </div>

      <div className="flex w-full flex-wrap items-start gap-[30px]">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-[160px] w-full min-w-[320px] flex-1 animate-pulse rounded-[20px] bg-white"
            />
          ))
        ) : data?.length ? (
          data.map((member) => (
            <FamilyMemberCard key={member.id} member={member} />
          ))
        ) : (
          <div className="flex w-full flex-col items-center gap-2 rounded-[20px] bg-white py-16 text-center">
            <p className="text-base text-[#546256]">
              No family members added yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
