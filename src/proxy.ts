import {
  AUTH_COOKIE_NAMES,
  isPublicPath,
  resolvePostLoginPath,
} from "@/lib/auth/constants";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const AUTH_PATH_PREFIXES = ["/login", "/signup", "/forgot-password", "/signin"];

function isAuthPath(pathname: string): boolean {
  return AUTH_PATH_PREFIXES.some((path) => pathname.startsWith(path));
}

function hasAuthSession(request: NextRequest): boolean {
  return AUTH_COOKIE_NAMES.some((name) => request.cookies.has(name));
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API rewrite path — never apply page auth redirects here.
  if (pathname === "/v1" || pathname.startsWith("/v1/")) {
    return NextResponse.next();
  }

  const hasSession = hasAuthSession(request);
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
    const redirect = request.nextUrl.searchParams.get("redirect");
    const target = resolvePostLoginPath(redirect);
    return NextResponse.redirect(new URL(target, request.url));
  }

  if (!isAuthRoute && !hasSession && !isPublicPath(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  // Skip static assets and the /v1 API rewrite path entirely.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|v1/|.*\\..*).*)"],
};
