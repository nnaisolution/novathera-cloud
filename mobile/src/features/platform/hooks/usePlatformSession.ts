import { useAuth } from "../../../auth/AuthProvider";

/**
 * Whether the NestJS platform session is usable right now.
 *
 * `"unavailable"` is a resting state, not a transient failure. The platform
 * session is minted by trading a 120-second link token that only `verifyOtp`
 * issues, so once it is gone there is no credential left on the device that
 * could mint another one. Screens must render it as an outcome and stop
 * querying rather than retry or spin.
 */
export type PlatformSessionState = "ready" | "pending" | "unavailable";

export function usePlatformSession(): PlatformSessionState {
  const { status, nestStatus } = useAuth();

  if (nestStatus === "linked") return "ready";
  if (nestStatus === "unavailable") return "unavailable";
  // "unknown" only survives while the provider is still restoring credentials;
  // once it has settled on a signed-in patient it has also settled this.
  return status === "loading" ? "pending" : "unavailable";
}
