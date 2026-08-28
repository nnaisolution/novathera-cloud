"use client";

import { useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useFamilyMemberActions } from "../hooks/use-family-members";
import type { FamilyMember } from "../types";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

export function FamilyMemberCard({ member }: { member: FamilyMember }) {
  const { updateMember, isUpdating, deleteMember, isDeleting } =
    useFamilyMemberActions();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(member.name);
  const [relationship, setRelationship] = useState(member.relationship);

  async function handleSave() {
    await updateMember({ id: member.id, name: name.trim(), relationship: relationship.trim() });
    setOpen(false);
  }

  async function handleDelete() {
    await deleteMember(member.id);
    setOpen(false);
  }

  return (
    <div className="flex w-full min-w-[320px] flex-1 items-center justify-between gap-4 rounded-[20px] bg-white p-[30px]">
      <div className="flex items-center gap-5">
        <div className="flex size-[100px] shrink-0 items-center justify-center rounded-full bg-[#e5ebd8] font-serif text-2xl text-[#185b50]">
          {getInitials(member.name)}
        </div>
        <div className="flex flex-col items-start gap-2.5">
          <p className="font-serif text-2xl text-[#185b50]">{member.name}</p>
          <p className="text-base text-[#546256]">{member.relationship}</p>
          <p className="text-base text-[#bf913d]">
            {member.visitsThisYear} visits this year
          </p>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <button
              type="button"
              className="h-[39px] shrink-0 rounded-full border border-[#546256] px-[15px] py-[11px] text-sm leading-none text-[#546256] transition-colors hover:bg-[#546256]/5"
            >
              Manage
            </button>
          }
        />
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>Manage family member</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Full name"
              className="rounded-lg border border-[#e8e8e8] bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-[#185b50]"
            />
            <input
              value={relationship}
              onChange={(event) => setRelationship(event.target.value)}
              placeholder="Relationship"
              className="rounded-lg border border-[#e8e8e8] bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-[#185b50]"
            />
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-full border border-[#fd3018] px-[15px] py-[11px] text-sm text-[#fd3018] disabled:opacity-60"
            >
              {isDeleting ? "Removing..." : "Remove"}
            </button>
            <DialogClose
              render={
                <button
                  type="button"
                  className="rounded-full border border-[#546256] px-[15px] py-[11px] text-sm text-[#546256]"
                >
                  Cancel
                </button>
              }
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={isUpdating || !name.trim() || !relationship.trim()}
              className="rounded-full bg-[#185b50] px-[15px] py-[11px] text-sm text-white disabled:opacity-60"
            >
              {isUpdating ? "Saving..." : "Save changes"}
            </button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </div>
  );
}
