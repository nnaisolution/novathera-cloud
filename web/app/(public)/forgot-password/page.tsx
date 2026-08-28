import { Suspense } from "react";

import { ForgotPasswordView } from "@/components/features/auth";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="h-dvh bg-[#faf7ee]" />}>
      <ForgotPasswordView />
    </Suspense>
  );
}
