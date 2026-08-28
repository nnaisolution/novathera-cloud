import { Suspense } from "react";

import { LoginView } from "@/components/features/auth";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-dvh bg-[#faf7ee]" />}>
      <LoginView />
    </Suspense>
  );
}
