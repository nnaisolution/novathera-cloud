import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
// Type-only, so the import is erased before Metro ever sees it and no backend
// code reaches the bundle. Resolved through the `@novathera/patient-api` path
// alias in tsconfig.json.
import type { AppRouter as PatientAppRouter } from "@novathera/patient-api";
import { env } from "../config/env";
import { refreshPatientSession } from "../auth/patientSession";
import { unauthorizedLink } from "./unauthorizedLink";

export type { PatientAppRouter };

export type PatientTrpcClientOptions = {
  /** Injected rather than imported from the auth context, which would cycle. */
  getAccessToken: () => Promise<string | null>;
  /** Called when the refresh token itself is dead and only a new OTP can help. */
  onSessionExpired: () => void | Promise<void>;
};

export function createPatientTrpcClient(options: PatientTrpcClientOptions) {
  return createTRPCClient<PatientAppRouter>({
    links: [
      unauthorizedLink<PatientAppRouter>(async () => {
        // Deduped app-wide in patientSession: concurrent batches that all see a
        // 401 wait on one rotation instead of racing to invalidate each other.
        const outcome = await refreshPatientSession();

        if (outcome.status === "refreshed") {
          // The retry re-runs `headers` below, which reads the freshly stored
          // token, so the replayed batch carries the new credential.
          return "retry";
        }

        if (outcome.status === "expired") {
          await options.onSessionExpired();
        }

        // "unavailable" means the network or server is unhappy, not that the
        // session is invalid, so the user keeps their session and the query just
        // fails.
        return "fail";
      }),
      httpBatchLink({
        url: `${env.apiUrl}/api/trpc`,
        transformer: superjson,
        async headers() {
          const token = await options.getAccessToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
}

export type PatientTrpcClient = ReturnType<typeof createPatientTrpcClient>;
