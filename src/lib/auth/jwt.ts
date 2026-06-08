/** Decode JWT `exp` (seconds since epoch). Returns null if invalid. */
export function getAccessTokenExpiryMs(accessToken: string): number | null {
  try {
    const parts = accessToken.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const decoded = JSON.parse(atob(padded)) as { exp?: number };
    if (typeof decoded.exp !== "number") return null;
    return decoded.exp * 1000;
  } catch {
    return null;
  }
}
