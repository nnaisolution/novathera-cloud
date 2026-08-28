import { useQuery } from "@tanstack/react-query";

import { usePatientTrpc } from "../../../api/trpc";
import { findEnrollment, type ProgramEnrollment } from "../programs";

/** Enrollments only change when the care team updates them. */
const PROGRAMS_STALE_TIME = 60_000;

export function useProgramEnrollments() {
  const trpc = usePatientTrpc();
  return useQuery(
    trpc.programs.list.queryOptions(undefined, {
      staleTime: PROGRAMS_STALE_TIME,
    }),
  );
}

export function useProgramEnrollment(id: string | undefined): {
  enrollment: ProgramEnrollment | undefined;
  isPending: boolean;
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
  refetch: () => void;
} {
  const list = useProgramEnrollments();
  const enrollment = id && list.data ? findEnrollment(list.data, id) : undefined;

  return {
    enrollment,
    isPending: list.isPending,
    isFetching: list.isFetching,
    isError: list.isError,
    isSuccess: list.isSuccess,
    refetch: () => {
      void list.refetch();
    },
  };
}
