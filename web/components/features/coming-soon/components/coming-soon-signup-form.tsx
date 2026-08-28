"use client";

import { WaitlistForm } from "@/components/features/waitlist";

export function ComingSoonSignupForm() {
  return (
    <div className="mt-10 w-full">
      <WaitlistForm submitLabel="Sign up for launch updates" />
    </div>
  );
}
