"use client";

import React from "react";
import type { AccountKpis } from "@/modules/clients/types";

interface KpiCardConfig {
  key: keyof AccountKpis;
  label: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  showStatusDot?: boolean;
  dotColor?: string;
}

const KPI_CARDS: KpiCardConfig[] = [
  {
    key: "businessCount",
    label: "Business Accounts",
    subtitle: "Registered Meta businesses",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
      </svg>
    ),
    iconBg: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    key: "wabaCount",
    label: "WABA Accounts",
    subtitle: "WhatsApp Business Accounts",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    iconBg: "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  {
    key: "phoneCount",
    label: "Phone Numbers",
    subtitle: "Registered sender numbers",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "connected",
    label: "Connected",
    subtitle: "Active phone numbers",
    showStatusDot: true,
    dotColor: "bg-emerald-500",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    iconBg: "bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400",
  },
];

export interface AccountsKpiCardsProps {
  kpis: AccountKpis;
  isLoading?: boolean;
  /** Compact layout for inline use (e.g. clients page header area). */
  compact?: boolean;
}

export function AccountsKpiCards({
  kpis,
  isLoading = false,
  compact = false,
}: AccountsKpiCardsProps) {
  if (isLoading) {
    return (
      <div
        className={`grid gap-4 ${compact ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"}`}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 animate-pulse ${compact ? "h-20" : "h-28"}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={`grid gap-4 ${compact ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"}`}
      >
        {KPI_CARDS.map((card) => (
          <div
            key={card.key}
            className={`rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-all duration-300 hover:shadow-md ${compact ? "p-4" : "p-5"}`}
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {card.label}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {card.showStatusDot && (
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${card.dotColor}`}
                    />
                  )}
                  <p
                    className={`font-extrabold text-gray-900 dark:text-white ${compact ? "text-xl" : "text-3xl"}`}
                  >
                    {kpis[card.key]}
                  </p>
                </div>
                {!compact && card.subtitle && (
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider mt-2">
                    {card.subtitle}
                  </p>
                )}
              </div>
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary status row */}
      {!compact && (kpis.pending > 0 || kpis.inactive > 0) && (
        <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 px-1">
          {kpis.pending > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {kpis.pending} pending
            </span>
          )}
          {kpis.inactive > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
              {kpis.inactive} inactive / disconnected
            </span>
          )}
        </div>
      )}
    </div>
  );
}
