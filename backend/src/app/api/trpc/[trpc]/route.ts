import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers";
import { createContext } from "@/server/context";
import { corsHeaders } from "@/lib/http/cors";

// The OPTIONS preflight below is not enough on its own: a browser also requires
// Access-Control-Allow-Origin on the actual response, and fetchRequestHandler
// does not know about our origin allow-list. Without this the mobile app works
// on iOS and Android (native fetch ignores CORS) but every tRPC query fails in
// a browser, which is how `npx expo start --web` is run locally.
const handler = async (req: Request) => {
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
  });

  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(req.headers.get("origin")))) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export { handler as GET, handler as POST };

export function OPTIONS(req: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
}
