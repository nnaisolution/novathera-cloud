"use client";

import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "@/lib/trpc/client";

export function useJoinWaitlist() {
  const trpc = useTRPC();

  return useMutation(trpc.waitlist.join.mutationOptions());
}
