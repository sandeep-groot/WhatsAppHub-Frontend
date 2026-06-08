/**
 * Auth session helpers (client) + shared constants for proxy
 */

import { AUTH_SESSION_COOKIE } from "./constants";

export {
  AUTH_SESSION_COOKIE,
  AUTH_PUBLIC_PATHS,
  isPublicPath,
} from "./constants";

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "auth_user";

export interface StoredAuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  name: string;
}

const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getAuthToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
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

export function setAuthSession(
  token: string,
  user: StoredAuthUser,
  refreshToken?: string,
): void {
  if (!isBrowser()) return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
  document.cookie = `${AUTH_SESSION_COOKIE}=1; path=/; max-age=${SESSION_MAX_AGE_SEC}; SameSite=Lax`;
  if (isBrowser()) {
    void import("./token-refresh").then(({ startProactiveRefresh }) => {
      startProactiveRefresh(token);
    });
  }
}

export function clearAuthSession(): void {
  if (!isBrowser()) return;
  void import("./token-refresh").then(({ stopProactiveRefresh }) => {
    stopProactiveRefresh();
  });
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `${AUTH_SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

/** @deprecated Use setAuthSession */
export function setAuthToken(token: string): void {
  if (!isBrowser()) return;
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${AUTH_SESSION_COOKIE}=1; path=/; max-age=${SESSION_MAX_AGE_SEC}; SameSite=Lax`;
}

/** @deprecated Use clearAuthSession */
export function removeAuthToken(): void {
  clearAuthSession();
}

export function setRefreshToken(token: string): void {
  if (!isBrowser()) return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}
