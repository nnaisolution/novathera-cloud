"use client";

import { WaitlistForm } from "@/components/features/waitlist/components/waitlist-form";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";

type WaitlistDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function WaitlistDialog({ open, onOpenChange }: WaitlistDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-[#023a40]">
            Join the waitlist
          </DialogTitle>
          <DialogDescription>
            Nova Thera is opening soon. Get early access to advanced aesthetics,
            recovery therapies, diagnostics, and biohacking — personalized
            through data, science, and holistic care.
          </DialogDescription>
        </DialogHeader>

        <WaitlistForm onSuccess={() => onOpenChange(false)} />
      </DialogPopup>
    </Dialog>
  );
}
