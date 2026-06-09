/** Cookie read by proxy (server). Must stay in sync with client session helpers. */
export const AUTH_SESSION_COOKIE = "wh-auth-session";

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
