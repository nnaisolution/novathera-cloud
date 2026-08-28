import { Suspense } from "react";

import { ResetPasswordView } from "@/components/features/auth";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="h-dvh bg-[#faf7ee]" />}>
      <ResetPasswordView />
    </Suspense>
  );
}
