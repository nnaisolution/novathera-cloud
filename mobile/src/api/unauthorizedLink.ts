import type { TRPCLink } from "@trpc/client";
import type { AnyRouter } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import type { Unsubscribable } from "@trpc/server/observable";

/** What the recovery handler decided: replay the operation, or give up. */
export type UnauthorizedResolution = "retry" | "fail";

/**
 * Catches `UNAUTHORIZED` from anywhere below it in the link chain and gives the
 * caller one chance to recover the session before the error surfaces.
 *
 * This sits above `httpBatchLink` on purpose. Batching means a single expired
 * token fails the whole HTTP request, and tRPC reports that either as an HTTP
 * 401 or as a per-procedure error inside a 200 response depending on how the
 * batch failed. Working at the link level normalises both into the same
 * `TRPCClientError`, and replaying through `next(op)` re-enters the batcher so
 * the retried operations are re-sent as a properly formed batch rather than a
 * hand-rebuilt request.
 */
export function unauthorizedLink<TRouter extends AnyRouter>(
  onUnauthorized: () => Promise<UnauthorizedResolution>,
): TRPCLink<TRouter> {
  return () =>
    ({ op, next }) =>
      observable((observer) => {
        // Per-operation, so a token that is somehow still rejected after a
        // successful refresh fails instead of looping.
        let retried = false;
        let disposed = false;
        let subscription: Unsubscribable | null = null;

        const execute = () => {
          subscription = next(op).subscribe({
            next(value) {
              observer.next(value);
            },
            error(error) {
              if (retried || error.data?.code !== "UNAUTHORIZED") {
                observer.error(error);
                return;
              }
              retried = true;
              subscription?.unsubscribe();

              void onUnauthorized().then(
                (resolution) => {
                  if (disposed) return;
                  if (resolution === "retry") {
                    execute();
                    return;
                  }
                  observer.error(error);
                },
                () => {
                  // Surface the original auth error, not the recovery failure.
                  if (!disposed) observer.error(error);
                },
              );
            },
            complete() {
              observer.complete();
            },
          });
        };

        execute();

        return () => {
          disposed = true;
          subscription?.unsubscribe();
        };
      });
}
