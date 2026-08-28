import { useRef, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCContext } from "@trpc/tanstack-react-query";

import { useAuth } from "../auth/AuthProvider";
import { getValidPatientAccessToken } from "../auth/patientSession";
import { getNestToken } from "../auth/secureStorage";
import { createPatientTrpcClient, type PatientAppRouter } from "./patient-client";
import { createNestTrpcClient, type NestAppRouter } from "./nest-client";

const { TRPCProvider: PatientTRPCProvider, useTRPC: usePatientTRPC } =
  createTRPCContext<PatientAppRouter>();

const { TRPCProvider: NestTRPCProvider, useTRPC: useNestTRPC } =
  createTRPCContext<NestAppRouter>();

/** Procedures on the Next.js patient API: health, profile, consent, programs. */
export const usePatientTrpc = usePatientTRPC;

/** Procedures on the NestJS platform API: bookings, membership, documents. */
export const useNestTrpc = useNestTRPC;

/**
 * One QueryClient serves both routers, so the error type is not tied to either
 * router's TRPCClientError generic; read the code structurally instead.
 */
function trpcErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const data = (error as { data?: unknown }).data;
  if (typeof data !== "object" || data === null) return undefined;
  const code = (data as { code?: unknown }).code;
  return typeof code === "string" ? code : undefined;
}

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Mobile screens remount constantly through the navigator; a short
        // window keeps navigation from refetching everything on every push.
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        // React Native has no window focus event. React Query's RN adapter maps
        // this onto AppState, so leaving it on refetches every time the app is
        // foregrounded, which is wasteful on cellular. Screens that need live
        // data should opt in with refetchInterval or an explicit invalidate.
        refetchOnWindowFocus: false,
        retry: (failureCount, error: unknown) => {
          // The link layer already handled auth; retrying a rejected session
          // just burns requests.
          const code = trpcErrorCode(error);
          if (code === "UNAUTHORIZED" || code === "FORBIDDEN") return false;
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function TrpcProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  // The clients are built once, but they need the newest auth callbacks. A ref
  // keeps the injected handlers current without re-creating the clients (which
  // would drop every in-flight request) and without importing the context into
  // the client modules.
  const authRef = useRef(auth);
  authRef.current = auth;

  const [queryClient] = useState(createQueryClient);

  const [patientClient] = useState(() =>
    createPatientTrpcClient({
      getAccessToken: getValidPatientAccessToken,
      onSessionExpired: () => authRef.current.signOut(),
    }),
  );

  const [nestClient] = useState(() =>
    createNestTrpcClient({
      getToken: getNestToken,
      // Degrade to patient-only features; see nest-client.ts for why the
      // platform session cannot be re-established without a new OTP.
      onSessionExpired: () => authRef.current.markNestSessionExpired(),
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <PatientTRPCProvider trpcClient={patientClient} queryClient={queryClient}>
        <NestTRPCProvider trpcClient={nestClient} queryClient={queryClient}>
          {children}
        </NestTRPCProvider>
      </PatientTRPCProvider>
    </QueryClientProvider>
  );
}
