"use client";

import React from "react";
import Link from "next/link";
import { AccountsKpiCards } from "@/components/clients/AccountsKpiCards";
import { useSystemHealth } from "@/modules/health/client/hooks";
import { useYCloudAccounts } from "@/modules/clients/client/hooks";
import type { HealthCheckResult } from "@/modules/health/types";
import { PAGE_ROUTES } from "@/lib/constants";
import { RefreshIcon } from "@/icons";

/* ── Status helpers ───────────────────────────────────────────────────────── */

type StatusLevel = "ok" | "degraded" | "down" | "loading";

function statusLevel(
  result: HealthCheckResult | null | undefined,
  unreachable: boolean
): StatusLevel {
  if (unreachable && !result) return "down";
  if (!result) return "loading";
  if (!result.ok) return "down";
  if (result.data?.status === "degraded") return "degraded";
  if (result.data?.status === "ok") return "ok";
  return "degraded";
}

const STATUS_STYLES: Record<
  StatusLevel,
  { dot: string; badge: string; label: string }
> = {
  ok: {
    dot: "bg-emerald-500",
    badge:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
    label: "Healthy",
  },
  degraded: {
    dot: "bg-amber-500",
    badge:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
    label: "Degraded",
  },
  down: {
    dot: "bg-rose-500",
    badge:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20",
    label: "Down",
  },
  loading: {
    dot: "bg-gray-300 dark:bg-gray-600",
    badge:
      "bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-700/50 dark:text-gray-400 dark:border-gray-600",
    label: "Checking…",
  },
};

function StatusBadge({ level }: { level: StatusLevel }) {
  const s = STATUS_STYLES[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${s.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

interface EndpointCardProps {
  title: string;
  result: HealthCheckResult | null | undefined;
  unreachable: boolean;
  showDatabase?: boolean;
}

function EndpointCard({
  title,
  result,
  unreachable,
  showDatabase = false,
}: EndpointCardProps) {
  const level = statusLevel(result, unreachable);
  const data = result?.data;

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
        <StatusBadge level={level} />
      </div>

      {showDatabase && data?.checks?.database && (
        <dl className="mt-4 text-xs">
          <div className="flex justify-between gap-4">
            <dt className="text-gray-400 dark:text-gray-500 font-medium">Database</dt>
            <dd
              className={`font-mono font-semibold ${
                data.checks.database === "up"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {data.checks.database}
            </dd>
          </div>
        </dl>
      )}
    </div>
  );
}

/* ── Dashboard ────────────────────────────────────────────────────────────── */

export default function DashboardContent() {
  const { data, isLoading, isFetching, refetch } = useSystemHealth();
  const {
    kpis,
    isLoading: accountsLoading,
    isFetching: accountsFetching,
    refetch: refetchAccounts,
  } = useYCloudAccounts();

  const unreachable = data?.unreachable ?? false;
  const summaryLevel = isLoading
    ? "loading"
    : unreachable
      ? "down"
      : data?.summary?.data?.status === "ok"
        ? data.ready?.ok
          ? "ok"
          : "degraded"
        : "degraded";

  const overallStyles = STATUS_STYLES[summaryLevel];
  const refreshing = isFetching || accountsFetching;

  const handleRefreshAll = () => {
    refetch();
    refetchAccounts();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Backend health and WhatsApp account overview. Auto-refreshes every 30 seconds.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefreshAll}
          disabled={refreshing}
          className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 flex items-center gap-2 self-start"
        >
          {refreshing ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin" />
          ) : (
            <RefreshIcon />
          )}
          Refresh
        </button>
      </div>

      {/* System health */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          System Status
        </h2>
        <div className={`rounded-2xl border p-5 ${overallStyles.badge} border-current/20`}>
          <div className="flex items-center gap-3 mb-5">
            <div
              className={`w-3 h-3 rounded-full shrink-0 ${overallStyles.dot} ${
                summaryLevel === "ok" ? "animate-pulse" : ""
              }`}
            />
            <p className="font-bold text-base">
              {summaryLevel === "loading" && "Checking backend health…"}
              {summaryLevel === "ok" && "All systems operational"}
              {summaryLevel === "degraded" && "System degraded — database or readiness issue"}
              {summaryLevel === "down" && "Backend unreachable"}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 animate-pulse h-24"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EndpointCard title="Liveness" result={data?.live} unreachable={unreachable} />
              <EndpointCard
                title="Readiness"
                result={data?.ready}
                unreachable={unreachable}
                showDatabase
              />
            </div>
          )}
        </div>
      </section>

      {/* WhatsApp accounts KPIs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            WhatsApp Accounts
          </h2>
          <Link
            href={PAGE_ROUTES.CLIENTS}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            View all clients →
          </Link>
        </div>
        <AccountsKpiCards kpis={kpis} isLoading={accountsLoading} />
      </section>
    </div>
  );
}
