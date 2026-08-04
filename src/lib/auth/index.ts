/**
 * Client-side auth session helpers (user profile cache only).
 * Access / refresh tokens are HttpOnly cookies managed by the backend.
 */

export {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  AUTH_SESSION_COOKIE,
  AUTH_COOKIE_NAMES,
  AUTH_PUBLIC_PATHS,
  isPublicPath,
  resolvePostLoginPath,
} from "./constants";

import { AUTH_SESSION_COOKIE } from "./constants";

const USER_KEY = "auth_user";
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

export interface StoredAuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  name: string;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function sessionCookieSuffix(maxAgeSec: number): string {
  const secure =
    isBrowser() && window.location.protocol === "https:" ? "; Secure" : "";
  return `path=/; max-age=${maxAgeSec}; SameSite=Strict${secure}`;
}

/** Marks an authenticated session for same-origin route protection (path=/). */
export function markSessionActive(): void {
  if (!isBrowser()) return;
  document.cookie = `${AUTH_SESSION_COOKIE}=1; ${sessionCookieSuffix(SESSION_MAX_AGE_SEC)}`;
}

export function hasActiveSessionMarker(): boolean {
  if (!isBrowser()) return false;
  const hasCookie = document.cookie.includes(`${AUTH_SESSION_COOKIE}=`);
  const hasUser = localStorage.getItem(USER_KEY) !== null;
  return hasCookie || hasUser;
}

export function getStoredUser(): StoredAuthUser | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuthUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: StoredAuthUser): void {
  if (!isBrowser()) return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  markSessionActive();
}

export function clearAuthSession(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    /* noop */
  }
  try {
    sessionStorage.clear();
  } catch {
    /* noop */
  }
  const secure =
    window.location.protocol === "https:" ? "; Secure" : "";
  const pastDate = "expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0";
  document.cookie = `${AUTH_SESSION_COOKIE}=; path=/; ${pastDate}; SameSite=Lax${secure}`;
  document.cookie = `access_token=; path=/; ${pastDate}; SameSite=Lax${secure}`;
  document.cookie = `refresh_token=; path=/; ${pastDate}; SameSite=Lax${secure}`;
}
