"use client";

import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "@/lib/trpc/client";

export function useSubmitContact() {
  const trpc = useTRPC();

  return useMutation(trpc.contact.submit.mutationOptions());
}
