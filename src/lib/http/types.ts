export interface ApiResponseBody<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}

export type ApiRequestConfig = {
  method?: string;
  data?: unknown;
  /** @deprecated Prefer `data` — kept for callers passing JSON.stringify body */
  body?: string;
  headers?: Record<string, string>;
  /** Skip 401 refresh + retry (login, logout, refresh endpoints) */
  skipAuthRefresh?: boolean;
  /** @deprecated Cookie auth always sends credentials; kept for API compatibility */
  skipAuth?: boolean;
  /** @deprecated Cookie auth always sends credentials */
  withCredentials?: boolean;
};
