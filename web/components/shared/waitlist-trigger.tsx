"use client";

import { useWaitlist } from "@/components/features/waitlist";
import { Button } from "@/components/ui/button";

type WaitlistTriggerProps = {
  children: React.ReactNode;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
};

export function WaitlistTrigger({
  children,
  className,
  variant,
}: WaitlistTriggerProps) {
  const { openWaitlist } = useWaitlist();

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={openWaitlist}
    >
      {children}
    </Button>
  );
}
