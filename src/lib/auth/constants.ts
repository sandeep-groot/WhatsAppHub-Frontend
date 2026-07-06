/** HttpOnly cookies set by the backend on login / refresh. */
export const ACCESS_TOKEN_COOKIE = "accessToken";
export const REFRESH_TOKEN_COOKIE = "refreshToken";

/**
 * Client-readable session flag (path=/). Used by proxy when backend cookies
 * are scoped to /v1 or another path and are not visible on page routes.
 */
export const AUTH_SESSION_COOKIE = "wh-auth-session";

export const AUTH_COOKIE_NAMES = [
  ACCESS_TOKEN_COOKIE,
  "access_token",
  AUTH_SESSION_COOKIE,
] as const;

export const AUTH_PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/privacy",
  "/terms",
  "/data-deletion",
] as const;

export function isPublicPath(pathname: string): boolean {
  return (
    AUTH_PUBLIC_PATHS.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/images/")
  );
}

export function resolvePostLoginPath(
  redirect: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    return redirect;
  }
  return fallback;
}
