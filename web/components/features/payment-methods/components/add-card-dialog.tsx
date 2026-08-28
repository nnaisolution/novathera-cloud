"use client";

import { useEffect, useState } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getStripe, stripePublishableKey } from "@/lib/stripe/client";

import { usePaymentMethodActions } from "../hooks/use-payment-methods";

function AddCardForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isConfirming, setIsConfirming] = useState(false);

  async function handleSubmit() {
    if (!stripe || !elements) return;
    setIsConfirming(true);

    const { error } = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
    });

    setIsConfirming(false);

    if (error) {
      toast.error(error.message ?? "Unable to save your card.");
      return;
    }

    toast.success("Card saved");
    onSuccess();
  }

  return (
    <div className="flex flex-col gap-4">
      <PaymentElement />
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
          onClick={handleSubmit}
          disabled={!stripe || isConfirming}
          className="rounded-full bg-[#185b50] px-[15px] py-[11px] text-sm text-white disabled:opacity-60"
        >
          {isConfirming ? "Saving..." : "Save card"}
        </button>
      </DialogFooter>
    </div>
  );
}

export function AddCardDialog() {
  const { createSetupIntent } = usePaymentMethodActions();
  const [open, setOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    createSetupIntent()
      .then((result) => setClientSecret(result.clientSecret))
      .catch(() => setOpen(false));
  }, [open, createSetupIntent]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setClientSecret(null);
  }

  if (!stripePublishableKey) {
    return (
      <button
        type="button"
        onClick={() =>
          toast.info("Payments aren't configured in this environment yet.")
        }
        className="flex h-[50px] items-center justify-center gap-2.5 rounded-2xl border border-black/50 px-5 text-lg text-[#185b50] transition-colors hover:bg-[#185b50]/5"
      >
        <Plus className="size-6" aria-hidden />
        Add New Card
      </button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="flex h-[50px] items-center justify-center gap-2.5 rounded-2xl border border-black/50 px-5 text-lg text-[#185b50] transition-colors hover:bg-[#185b50]/5"
          >
            <Plus className="size-6" aria-hidden />
            Add New Card
          </button>
        }
      />
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Add a card</DialogTitle>
        </DialogHeader>
        {clientSecret ? (
          <Elements stripe={getStripe()} options={{ clientSecret }}>
            <AddCardForm onSuccess={() => setOpen(false)} />
          </Elements>
        ) : (
          <div className="h-40 animate-pulse rounded-lg bg-[#f3f3f3]" />
        )}
      </DialogPopup>
    </Dialog>
  );
}
