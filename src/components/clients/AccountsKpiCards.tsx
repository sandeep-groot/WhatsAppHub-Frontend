"use client";

import React from "react";
import type { AccountKpis } from "@/modules/clients/types";
import {
  BriefcaseBusinessIcon,
  CheckCircleIcon,
  PhoneIcon,
  RotateIcon,
  WhatsAppIcon,
} from "@/icons";
import { KPI_CARD_COPY } from "@/lib/constants";

const KPI_ICONS: Record<keyof AccountKpis, React.ReactNode> = {
  businessCount: <BriefcaseBusinessIcon className="w-5 h-5" />,
  wabaCount: <WhatsAppIcon className="w-5 h-5" />,
  phoneCount: <PhoneIcon />,
  connected: <CheckCircleIcon />,
  pending: <RotateIcon />,
  inactive: <CheckCircleIcon />,
};

interface KpiCardConfig {
  key: keyof AccountKpis;
  label: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  showStatusDot?: boolean;
  dotColor?: string;
}

const KPI_CARDS: KpiCardConfig[] = KPI_CARD_COPY.map((card) => ({
  ...card,
  icon: KPI_ICONS[card.key],
}));

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
        className={`grid gap-4 ${
          compact
            ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
        }`}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 animate-pulse ${
              compact ? "h-20" : "h-28"
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={`grid gap-4 ${
          compact
            ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
        }`}
      >
        {KPI_CARDS.map((card) => (
          <div
            key={card.key}
            className={`rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm transition-all duration-300 hover:shadow-md ${
              compact ? "p-4" : "p-5"
            }`}
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
                    className={`font-extrabold text-gray-900 dark:text-white ${
                      compact ? "text-xl" : "text-3xl"
                    }`}
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
    </div>
  );
}
