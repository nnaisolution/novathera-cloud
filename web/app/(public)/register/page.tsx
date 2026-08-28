import { Suspense } from "react";

import { RegisterView } from "@/components/features/auth";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="h-dvh bg-[#faf7ee]" />}>
      <RegisterView />
    </Suspense>
  );
}
