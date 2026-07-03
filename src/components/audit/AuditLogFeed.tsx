"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteAuditLogs } from "@/modules/audit/client/hooks";
import type { AuditLog } from "@/modules/audit/types";
import { ClipboardCheckIcon, CloseIcon, SearchIcon } from "@/icons";
import { EMPTY_STATE_COPY } from "@/lib/constants";

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function actorName(actor: AuditLog["actor"]): string {
  if (!actor) return "Unknown";
  const name = [actor.firstName, actor.lastName].filter(Boolean).join(" ").trim();
  return name || actor.email || "Unknown";
}

function actorInitials(actor: AuditLog["actor"]): string {
  if (!actor) return "?";
  const first = actor.firstName?.[0] ?? "";
  const last = actor.lastName?.[0] ?? "";
  const initials = `${first}${last}`.trim();
  return (initials || actor.email?.[0] || "?").toUpperCase();
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diffMs = now - d.getTime();
  if (Number.isNaN(d.getTime())) return iso;

  const sec = Math.round(diffMs / 1000);
  if (sec < 60) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return formatDateTime(iso);
}

function actionAccent(action: string): { dot: string; text: string } {
  if (action.startsWith("auth"))
    return { dot: "bg-sky-500", text: "text-sky-600 dark:text-sky-400" };
  if (action.includes("delete") || action.includes("remove"))
    return { dot: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" };
  if (action.includes("send") || action.includes("create"))
    return { dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" };
  if (action.includes("update"))
    return { dot: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" };
  return { dot: "bg-gray-400", text: "text-gray-600 dark:text-gray-300" };
}

/** Builds a single lowercase haystack string for client-side searching. */
function searchHaystack(log: AuditLog): string {
  const parts: string[] = [
    log.action,
    log.entityType,
    log.entityId,
    log.ipAddress ?? "",
    log.actor?.email ?? "",
    actorName(log.actor),
  ];
  if (log.metadata) {
    for (const [k, v] of Object.entries(log.metadata)) {
      parts.push(k, v == null ? "" : String(v));
    }
  }
  return parts.join(" ").toLowerCase();
}

/* ── Row ──────────────────────────────────────────────────────────────────── */

function AuditLogRow({ log }: { log: AuditLog }) {
  const accent = actionAccent(log.action);
  const metaEntries = log.metadata ? Object.entries(log.metadata) : [];

  return (
    <div className="p-4 sm:px-6 flex gap-4 hover:bg-gray-50/40 dark:hover:bg-gray-700/20 transition-colors">
      {/* Avatar */}
      <div className="w-9 h-9 shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-bold">
        {actorInitials(log.actor)}
      </div>

      <div className="min-w-0 flex-1">
        {/* Top line: action + time */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${accent.dot}`} />
            <span className={`font-mono text-sm font-semibold truncate ${accent.text}`}>
              {log.action}
            </span>
          </div>
          <time
            dateTime={log.createdAt}
            title={formatDateTime(log.createdAt)}
            className="text-xs text-gray-400 dark:text-gray-500 shrink-0 whitespace-nowrap"
          >
            {formatRelativeTime(log.createdAt)}
          </time>
        </div>

        {/* Actor + entity */}
        <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold text-gray-900 dark:text-white">
            {actorName(log.actor)}
          </span>
          {log.actor?.email && (
            <span className="text-gray-400 dark:text-gray-500"> · {log.actor.email}</span>
          )}
        </p>

        {/* Entity + metadata chips */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300">
            {log.entityType}
          </span>
          {log.ipAddress && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-50 dark:bg-gray-700/30 text-gray-500 dark:text-gray-400 font-mono">
              {log.ipAddress}
            </span>
          )}
          {metaEntries.map(([key, value]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-50 dark:bg-gray-700/30 text-gray-500 dark:text-gray-400"
            >
              <span className="text-gray-400 dark:text-gray-500">{key}:</span>
              <span className="font-mono text-gray-600 dark:text-gray-300 truncate max-w-[180px]">
                {value == null ? "—" : String(value)}
              </span>
            </span>
          ))}
        </div>

        {/* Entity id */}
        <p
          className="mt-1.5 text-[11px] font-mono text-gray-300 dark:text-gray-600 truncate"
          title={log.entityId}
        >
          {log.entityId}
        </p>
      </div>
    </div>
  );
}

/* ── Feed ─────────────────────────────────────────────────────────────────── */

export function AuditLogFeed() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteAuditLogs();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input for smoother filtering
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [search]);

  const allLogs = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data]
  );

  const total = data?.pages[0]?.meta.total ?? 0;

  const filteredLogs = useMemo(() => {
    if (!debouncedSearch) return allLogs;
    return allLogs.filter((log) => searchHaystack(log).includes(debouncedSearch));
  }, [allLogs, debouncedSearch]);

  // Auto-scroll pagination via IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  /* ── Loading (initial) ── */
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm divide-y divide-gray-100 dark:divide-gray-700/50">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 sm:px-6 flex gap-4 animate-pulse">
            <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/3" />
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ── Error ── */
  if (isError) {
    return (
      <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl p-6 flex flex-col items-center text-center">
        <h3 className="font-bold text-gray-950 dark:text-white mb-1">
          Failed to load audit logs
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-4">
          {(error as Error)?.message ||
            "The server responded with an error. Check your connection or credentials."}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by action, user, entity, IP, or metadata…"
          className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 dark:text-white transition-all"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Clear search"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Count summary */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
        <span>
          Showing <span className="font-semibold">{filteredLogs.length}</span>
          {debouncedSearch
            ? ` of ${allLogs.length} loaded`
            : ` of ${total} total`}{" "}
          {filteredLogs.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {/* List */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center mb-4 text-gray-400 dark:text-gray-500">
            <ClipboardCheckIcon />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
            {debouncedSearch
              ? EMPTY_STATE_COPY.auditLogs.emptySearchTitle
              : EMPTY_STATE_COPY.auditLogs.emptyTitle}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            {debouncedSearch
              ? EMPTY_STATE_COPY.auditLogs.emptySearchDescription
              : EMPTY_STATE_COPY.auditLogs.emptyDescription}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm divide-y divide-gray-100 dark:divide-gray-700/50 overflow-hidden">
          {filteredLogs.map((log) => (
            <AuditLogRow key={log.id} log={log} />
          ))}
        </div>
      )}

      {/* Infinite-scroll sentinel + status */}
      <div ref={sentinelRef} className="py-2 flex items-center justify-center">
        {isFetchingNextPage ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin" />
            Loading more…
          </div>
        ) : hasNextPage ? (
          <button
            onClick={() => fetchNextPage()}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            Load more
          </button>
        ) : (
          allLogs.length > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              You&apos;ve reached the end.
            </span>
          )
        )}
      </div>
    </div>
  );
}
