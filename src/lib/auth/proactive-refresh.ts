import { getAccessTokenExpiryMs } from "./jwt";

/** Refresh access token this many ms before JWT expiry */
const REFRESH_BUFFER_MS = 60_000;

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

export function clearProactiveRefresh(): void {
  if (refreshTimer !== null) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

/**
 * Schedules a silent token refresh shortly before the access token expires.
 */
export function scheduleProactiveRefresh(
  accessToken: string,
  refreshFn: () => Promise<boolean>,
): void {
  clearProactiveRefresh();

  const expiresAtMs = getAccessTokenExpiryMs(accessToken);
  if (!expiresAtMs) return;

  const refreshAtMs = expiresAtMs - REFRESH_BUFFER_MS;
  const delayMs = Math.max(refreshAtMs - Date.now(), 0);

  refreshTimer = setTimeout(() => {
    void refreshFn().catch(() => {
      /* hard failure handled inside refreshFn / session events */
    });
  }, delayMs);
}
