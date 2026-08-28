"use client";

import { usePaymentMethods } from "../hooks/use-payment-methods";
import { AddCardDialog } from "./add-card-dialog";
import { PaymentMethodCard } from "./payment-method-card";

export function PaymentMethodsView() {
  const { data: cards, isLoading } = usePaymentMethods();

  return (
    <div className="flex w-full flex-col items-start gap-[30px]">
      <div className="flex w-full flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col items-start gap-2.5">
          <h1 className="font-serif text-[40px] leading-none text-[#185b50]">
            Payment Method
          </h1>
          <p className="text-base text-[#546256]">Cards on file</p>
        </div>

        <AddCardDialog />
      </div>

      {isLoading ? (
        <div className="grid w-full grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="h-[220px] animate-pulse rounded-[20px] bg-[#f3f3f3]" />
          <div className="h-[220px] animate-pulse rounded-[20px] bg-[#f3f3f3]" />
        </div>
      ) : cards && cards.length > 0 ? (
        <div className="grid w-full grid-cols-1 gap-5 lg:grid-cols-2">
          {cards.map((card) => (
            <PaymentMethodCard key={card.id} card={card} />
          ))}
        </div>
      ) : (
        <p className="text-base text-[#546256]">
          You haven&apos;t added a payment method yet.
        </p>
      )}
    </div>
  );
}
