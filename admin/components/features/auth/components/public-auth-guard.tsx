"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function PublicAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (session?.user.emailVerified) {
      router.replace("/");
    }
  }, [isPending, router, session]);

  // Show the form immediately. Waiting on getSession blocks the login page
  // for a full Render cold start (often 1–2 minutes) with no way to retry.
  if (session?.user.emailVerified) {
    return null;
  }

  return <>{children}</>;
}
