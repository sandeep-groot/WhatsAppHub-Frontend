/**
 * Shared default values for hooks, forms, and query client configuration.
 */

export const POLLING_DEFAULTS = {
  healthIntervalMs: 30_000,
  healthStaleTimeMs: 10_000,
} as const;

export const PAGINATION_DEFAULTS = {
  auditLogLimit: 25,
} as const;

export const MESSAGE_FORM_DEFAULTS = {
  from: "",
  to: "",
};

export const QUERY_DEFAULTS = {
  staleTimeMs: 1000 * 60 * 5,
  gcTimeMs: 1000 * 60 * 10,
  retry: 1,
  refetchOnWindowFocus: false,
} as const;
