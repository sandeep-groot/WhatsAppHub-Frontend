import { API_ROUTES } from "@/lib/constants";
import { apiFetch } from "@/lib/http";
import type { AuthUser, LoginResponse } from "@/modules/auth/types";
import {
  getAuthToken,
  setAuthSession,
  type StoredAuthUser,
} from "./index";
import { refreshAccessToken } from "./token-refresh";
import { toStoredUser } from "./user-mapper";

export { toStoredUser } from "./user-mapper";

/** Stores tokens from login; user profile is loaded via getCurrentUser (ME API). */
export async function loginWithCredentials(
  email: string,
  password: string,
): Promise<void> {
  const data = await apiFetch<LoginResponse>(API_ROUTES.AUTH.LOGIN, {
    method: "POST",
    data: { email, password },
    skipAuth: true,
    skipAuthRefresh: true,
  });

  const placeholder = toStoredUser(data.user);
  setAuthSession(data.accessToken, placeholder, data.refreshToken);
}

export async function getCurrentUser(): Promise<StoredAuthUser> {
  const profile = await apiFetch<AuthUser>(API_ROUTES.AUTH.ME);
  const user = toStoredUser(profile);

  const token = getAuthToken();
  if (token) {
    setAuthSession(token, user);
  }

  return user;
}

export async function refreshSession(): Promise<boolean> {
  return refreshAccessToken();
}
