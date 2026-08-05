import { API_ROUTES } from "@/lib/constants";
import { apiFetch } from "@/lib/http";
import type { AuthUser } from "@/modules/auth/types";
import {
  clearAuthSession,
  markSessionActive,
  setStoredUser,
  type StoredAuthUser,
} from "./index";
import { refreshAccessToken } from "./token-refresh";
import { toStoredUser } from "./user-mapper";

export { toStoredUser } from "./user-mapper";

/** Login — backend sets HttpOnly auth cookies on the response. */
export async function loginWithCredentials(
  email: string,
  password: string,
  rememberMe?: boolean,
): Promise<void> {
  await apiFetch(API_ROUTES.AUTH.LOGIN, {
    method: "POST",
    data: { email, password, rememberMe },
    skipAuth: true,
    skipAuthRefresh: true,
  });
  markSessionActive();
}

export async function logoutSession(): Promise<void> {
  try {
    await apiFetch(API_ROUTES.AUTH.LOGOUT, {
      method: "POST",
      skipAuthRefresh: true,
    });
  } catch {
    /* Always clear local state even when the logout request fails. */
  } finally {
    clearAuthSession();
  }
}

export async function getCurrentUser(): Promise<StoredAuthUser> {
  const profile = await apiFetch<AuthUser>(API_ROUTES.AUTH.ME);
  const user = toStoredUser(profile);
  setStoredUser(user);
  return user;
}

export async function refreshSession(): Promise<boolean> {
  return refreshAccessToken();
}
