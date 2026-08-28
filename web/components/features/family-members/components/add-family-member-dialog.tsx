"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

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

export function AddFamilyMemberDialog() {
  const { createMember, isCreating } = useFamilyMemberActions();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");

  async function handleCreate() {
    await createMember({ name: name.trim(), relationship: relationship.trim() });
    setOpen(false);
    setName("");
    setRelationship("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="flex h-[50px] items-center justify-center gap-2.5 rounded-2xl border border-black/50 px-5 text-lg text-[#185b50] transition-colors hover:bg-[#185b50]/5"
          >
            <Plus className="size-6" aria-hidden />
            Add Family Member
          </button>
        }
      />
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Add family member</DialogTitle>
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
            placeholder="Relationship (e.g. Spouse, Daughter)"
            className="rounded-lg border border-[#e8e8e8] bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-[#185b50]"
          />
        </div>
        <DialogFooter>
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
            onClick={handleCreate}
            disabled={isCreating || !name.trim() || !relationship.trim()}
            className="rounded-full bg-[#185b50] px-[15px] py-[11px] text-sm text-white disabled:opacity-60"
          >
            {isCreating ? "Adding..." : "Add member"}
          </button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
