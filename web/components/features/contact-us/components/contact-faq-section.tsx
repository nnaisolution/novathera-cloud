"use client";

import { useState } from "react";

import { contactFaqs } from "@/components/features/contact-us/contact-us-data";
import { cn } from "@/lib/utils";

type ContactFaqSectionProps = {
  className?: string;
};

export function ContactFaqSection({ className }: ContactFaqSectionProps) {
  const [openId, setOpenId] = useState<string>(contactFaqs[0]?.id ?? "");

  return (
    <section
      className={cn(
        "bg-[#faf7ee] px-6 py-20 lg:px-[200px] lg:py-28",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[880px] flex-col items-center gap-14">
        <div className="flex flex-col items-center gap-[18.5px] text-center">
          <p className="text-base tracking-[3px] text-[#d79628] uppercase">
            Common questions
          </p>
          <h2 className="font-display text-4xl tracking-[-0.6px] text-[#0c1f13] sm:text-[48px]">
            Frequently asked{" "}
            <span className="text-[#d79628]">questions</span>
          </h2>
        </div>

        <div className="flex w-full flex-col gap-4">
          {contactFaqs.map((faq) => {
            const isOpen = openId === faq.id;

            return (
              <div
                key={faq.id}
                className={cn(
                  "rounded-3xl border p-px",
                  isOpen
                    ? "border-[rgba(215,150,40,0.4)] bg-[#faf7ee]"
                    : "border-[#d8d8cd] bg-[rgba(229,235,216,0.3)]",
                )}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? "" : faq.id)}
                >
                  <span className="font-display text-lg tracking-[-0.18px] text-[#0c1f13]">
                    {faq.question}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-xl leading-7 text-[#d79628] transition-transform",
                      isOpen && "rotate-45",
                    )}
                    aria-hidden
                  >
                    +
                  </span>
                </button>
                {isOpen ? (
                  <div className="px-6 pb-5">
                    <p className="text-base leading-[26px] text-[#546256]">
                      {faq.answer}
                    </p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
