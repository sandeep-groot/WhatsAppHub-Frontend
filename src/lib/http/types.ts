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
  /** Skip attaching Authorization header */
  skipAuth?: boolean;
  /** Skip 401 refresh + retry (login, refresh endpoints) */
  skipAuthRefresh?: boolean;
};
