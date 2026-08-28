import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ConsentPurpose, DataCategory } from "../../../shared";

import { usePatientTrpc } from "../../../api/trpc";
import { TREATMENT_DATA_CATEGORIES, type ConsentRecord } from "../consent";

const CONSENT_STALE_TIME = 30_000;

function toConsentRecord(row: {
  id: string;
  purpose: ConsentPurpose;
  granted: boolean;
  grantedAt: Date | null;
  revokedAt: Date | null;
  policyVersion: string;
  dataCategories: string[];
  updatedAt: Date;
}): ConsentRecord {
  return {
    id: row.id,
    purpose: row.purpose,
    granted: row.granted,
    grantedAt: row.grantedAt,
    revokedAt: row.revokedAt,
    policyVersion: row.policyVersion,
    dataCategories: row.dataCategories,
    updatedAt: row.updatedAt,
  };
}

export function useConsentList() {
  const trpc = usePatientTrpc();
  return useQuery(
    trpc.consent.list.queryOptions(undefined, {
      staleTime: CONSENT_STALE_TIME,
      select: (rows) => rows.map(toConsentRecord),
    }),
  );
}

export function useSetConsent() {
  const trpc = usePatientTrpc();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.consent.set.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: trpc.consent.list.queryKey() }),
    }),
  );
}

export function consentMutationInput(purpose: ConsentPurpose, granted: boolean) {
  return {
    purpose,
    granted,
    dataCategories: TREATMENT_DATA_CATEGORIES as DataCategory[],
  };
}
