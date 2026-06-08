/**
 * Query key factory for managing TanStack Query keys
 * Helps prevent key duplication and simplifies cache invalidation
 */

export const queryKeys = {
  all: ["query"] as const,
  
  // Auth queries
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
    session: () => [...queryKeys.auth.all, "session"] as const,
  },

  // Client queries
  clients: {
    all: ["clients"] as const,
    list: () => [...queryKeys.clients.all, "list"] as const,
    detail: (id: string) => [...queryKeys.clients.all, "detail", id] as const,
  },

  // User queries
  users: {
    all: ["users"] as const,
    list: () => [...queryKeys.users.all, "list"] as const,
    detail: (id: string) => [...queryKeys.users.all, "detail", id] as const,
  },

  // Role queries
  roles: {
    all: ["roles"] as const,
    list: () => [...queryKeys.roles.all, "list"] as const,
    detail: (id: string) => [...queryKeys.roles.all, "detail", id] as const,
  },

  // Webhook queries
  webhooks: {
    all: ["webhooks"] as const,
    list: () => [...queryKeys.webhooks.all, "list"] as const,
    detail: (id: string) => [...queryKeys.webhooks.all, "detail", id] as const,
  },

  // Audit log queries
  auditLogs: {
    all: ["auditLogs"] as const,
    list: () => [...queryKeys.auditLogs.all, "list"] as const,
  },
} as const;
