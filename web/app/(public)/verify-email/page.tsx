import { Suspense } from "react";

import { VerifyEmailView } from "@/components/features/auth";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="h-dvh bg-[#faf7ee]" />}>
      <VerifyEmailView />
    </Suspense>
  );
}
