"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "@/query/keys";
import { apiFetch } from "@/lib/http";
import type { AuditLogPage, ListAuditLogsParams } from "../types";
import { PAGINATION_DEFAULTS } from "@/lib/constants";

type AuditFilters = Omit<ListAuditLogsParams, "page" | "limit">;

/**
 * Infinite (auto-scroll) audit log feed backed by GET v1/audit-logs.
 * Each page returns `{ items, meta: { page, limit, total } }`.
 */
export function useInfiniteAuditLogs(
  filters: AuditFilters = {},
  limit: number = PAGINATION_DEFAULTS.auditLogLimit
) {
  return useInfiniteQuery<AuditLogPage>({
    queryKey: queryKeys.auditLogs.list({ ...filters, limit }),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const page = pageParam as number;
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (filters.actorId) query.set("actorId", filters.actorId);
      if (filters.entityType) query.set("entityType", filters.entityType);
      if (filters.entityId) query.set("entityId", filters.entityId);
      if (filters.action) query.set("action", filters.action);

      return apiFetch<AuditLogPage>(`/audit-logs?${query.toString()}`);
    },
    getNextPageParam: (lastPage) => {
      const { page, limit: pageLimit, total } = lastPage.meta;
      const totalPages = Math.max(1, Math.ceil(total / pageLimit));
      return page < totalPages ? page + 1 : undefined;
    },
  });
}
