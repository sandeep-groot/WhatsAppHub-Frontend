import { AUTH_SESSION_COOKIE, isPublicPath } from "@/lib/auth/constants";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_PATH_PREFIXES = ["/login", "/signup", "/forgot-password", "/signin"];

function isAuthPath(pathname: string): boolean {
  return AUTH_PATH_PREFIXES.some((path) => pathname.startsWith(path));
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(AUTH_SESSION_COOKIE);
  const isAuthRoute = isAuthPath(pathname);

  if (pathname.startsWith("/signin")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.search = request.nextUrl.search;
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/") {
    const target = hasSession ? "/dashboard" : "/login";
    return NextResponse.redirect(new URL(target, request.url));
  }

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isAuthRoute && !hasSession && !isPublicPath(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|.*\\..*).*)"],
};
