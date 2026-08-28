"use client";

import { usePaymentMethodActions } from "../hooks/use-payment-methods";
import type { PaymentMethod } from "../types";

function formatBrand(brand: string) {
  if (brand === "mastercard") return "Mastercard";
  return brand.toUpperCase();
}

export function PaymentMethodCard({ card }: { card: PaymentMethod }) {
  const { detachCard, isDetaching, setDefaultCard, isSettingDefault } =
    usePaymentMethodActions();

  return (
    <div className="flex w-full flex-col gap-[30px] rounded-[20px] bg-gradient-to-r from-[#185b50] to-[#33c1aa] p-[30px]">
      <div className="flex items-start justify-between">
        <div className="flex flex-col items-start gap-2.5">
          <p className="text-sm tracking-[1.4px] text-white uppercase">
            Nova Thera Card
          </p>
          <span className="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-xs tracking-[0.6px] text-white">
            {card.isDefault ? "PRIMARY" : "SECONDARY"}
          </span>
        </div>
        <p className="text-lg font-semibold text-white italic">
          {formatBrand(card.brand)}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <span className="tracking-[4px] text-white">••••</span>
        <span className="tracking-[4px] text-white">••••</span>
        <span className="tracking-[4px] text-white">••••</span>
        <span className="text-2xl text-white">{card.last4}</span>
      </div>

      <div className="flex w-full items-center justify-between text-sm text-white">
        <span>
          Exp : {String(card.expMonth).padStart(2, "0")}/
          {String(card.expYear).slice(-2)}
        </span>
        <div className="flex items-center gap-3">
          {!card.isDefault ? (
            <button
              type="button"
              onClick={() => setDefaultCard(card.id)}
              disabled={isSettingDefault}
              className="text-white underline underline-offset-2 disabled:opacity-60"
            >
              Set default
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => detachCard(card.id)}
            disabled={isDetaching}
            className="text-white underline underline-offset-2 disabled:opacity-60"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
