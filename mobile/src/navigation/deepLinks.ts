import type { Href } from "expo-router";

/**
 * Maps `novathera://…` URLs (and in-app `/care/…` paths used in push payloads)
 * onto Expo Router hrefs. Groups like `(app)` are omitted from the public URL.
 */
export function hrefFromDeepLink(raw: string): Href | null {
  const path = normalizeDeepLinkPath(raw);
  if (!path) return null;

  if (path === "/appointments" || path === "/care/appointments") {
    return "/(app)/care/appointments";
  }

  const appointment = path.match(/^\/(?:care\/)?appointments\/([^/]+)$/);
  if (appointment?.[1]) {
    return {
      pathname: "/(app)/care/appointments/[id]",
      params: { id: appointment[1] },
    };
  }

  if (
    path === "/booking/confirm" ||
    path === "/care/book" ||
    path === "/booking" ||
    path === "/care/book/confirm"
  ) {
    return "/(app)/care/book";
  }

  if (path === "/care/aftercare") {
    return "/(app)/care/aftercare";
  }

  if (path === "/care/programs") {
    return "/(app)/care/programs";
  }

  const program = path.match(/^\/care\/programs\/([^/]+)$/);
  if (program?.[1]) {
    return {
      pathname: "/(app)/care/programs/[id]",
      params: { id: program[1] },
    };
  }

  if (path === "/account/notifications") {
    return "/(app)/account/notifications";
  }

  return null;
}

export function rewriteNativeIntentPath(path: string): string {
  const href = hrefFromDeepLink(path);
  if (href === "/(app)/care/appointments") return "/care/appointments";
  if (href === "/(app)/care/book") return "/care/book";
  if (href && typeof href === "object" && "pathname" in href && href.pathname === "/(app)/care/appointments/[id]") {
    const params = "params" in href ? href.params : undefined;
    const id =
      params && typeof params === "object" && "id" in params ? params.id : undefined;
    if (typeof id === "string" && id.length > 0) return `/care/appointments/${id}`;
  }
  return stripScheme(path);
}

function normalizeDeepLinkPath(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return stripScheme(trimmed);
}

function stripScheme(raw: string): string {
  let path = raw.trim();
  const scheme = /^[a-z][a-z0-9+.-]*:\/\//i;
  if (scheme.test(path)) {
    path = path.replace(scheme, "");
    const slash = path.indexOf("/");
    // `novathera://care/appointments` → host is `care`, path is `/appointments`
    // `novathera:///care/appointments` → empty host, path `/care/appointments`
    if (slash === -1) {
      path = `/${path}`;
    } else if (slash === 0) {
      // already a path; drop empty host
    } else {
      const host = path.slice(0, slash);
      const rest = path.slice(slash);
      path = host === "--" || host.length === 0 ? rest : `/${host}${rest}`;
    }
  }
  path = path.split("?")[0]?.split("#")[0] ?? path;
  path = path.replace(/^\/--/, "");
  path = path.replace(/^\/\(app\)/, "");
  if (!path.startsWith("/")) path = `/${path}`;
  path = path.replace(/\/{2,}/g, "/");
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path;
}
