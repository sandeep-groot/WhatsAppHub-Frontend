"use client";

import React, { useState } from "react";
import PortfolioSubCard, { BusinessNode, PhoneNumber } from "./PortfolioSubCard";
import EditClientModal from "./EditClientModal";
import {
  ChevronDownIcon as ChevronDown,
  PlusIcon as Plus,
  BriefcaseBusinessIcon as BriefcaseBusiness,
  BuildingIcon as Building,
  UserIcon as User,
  EditIcon as EditPen,
} from "@/icons";
import Link from "next/link";
import { PAGE_ROUTES } from "@/lib/constants";

export interface ClientDetailMeta {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  companyName?: string | null;
}

export default function ClientGroupCard({
  clientDetail,
  businesses,
  onViewDetails,
  onOpenConsole,
  onRefresh,
}: {
  clientDetail: ClientDetailMeta | null;
  businesses: BusinessNode[];
  onViewDetails: (business: BusinessNode) => void;
  onOpenConsole: (phone: PhoneNumber) => void;
  onRefresh?: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Compute totals across portfolios
  const totalNumbers = businesses.reduce((sum, b) => sum + b.phoneCount, 0);

  // Generate initials for avatar
  const displayName = clientDetail?.name || "Direct / Unlinked Portfolios";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isUnlinkedGroup = !clientDetail;

  return (
    <div
      className={`rounded-3xl border transition-all duration-200 overflow-hidden shadow-sm ${
        isUnlinkedGroup
          ? "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30"
          : "border-emerald-500/20 dark:border-emerald-500/10 bg-gradient-to-b from-emerald-500/[0.02] to-transparent dark:bg-gray-900/60"
      }`}
    >
      {/* Top Header Banner */}
      <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between border-b border-gray-100 dark:border-gray-800/80">
        {/* Left Info Cluster */}
        <div
          onClick={() => setExpanded(!expanded)}
          className="flex flex-1 items-center gap-4 text-left cursor-pointer select-none"
        >
          {/* Avatar Icon */}
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold shadow-sm border ring-4 transition-all ${
              isUnlinkedGroup
                ? "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700 ring-gray-100 dark:ring-gray-800"
                : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-400/30 ring-emerald-500/10 shadow-emerald-500/20"
            }`}
          >
            {isUnlinkedGroup ? <BriefcaseBusiness className="w-5 h-5" /> : initials}
          </div>

          <div className="min-w-0 space-y-1.5 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base font-extrabold tracking-tight text-gray-900 dark:text-white">
                {displayName}
              </h2>

              {clientDetail?.companyName && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20 shadow-2xs">
                  <Building className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>{clientDetail.companyName}</span>
                </span>
              )}

              {isUnlinkedGroup && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20">
                  Unlinked Portfolios
                </span>
              )}

              <div className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors ml-auto sm:ml-0">
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    expanded ? "rotate-180 text-emerald-600 dark:text-emerald-400" : ""
                  }`}
                />
              </div>
            </div>

            {/* Metadata Contact Pills */}
            {clientDetail && (
              <div className="flex items-center gap-2 text-xs font-medium flex-wrap pt-0.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gray-100/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 border border-gray-200/60 dark:border-gray-700/60 text-[11px]">
                  <span className="text-gray-400">✉️</span>
                  <span className="font-semibold">{clientDetail.email}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gray-100/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 border border-gray-200/60 dark:border-gray-700/60 text-[11px] font-mono">
                  <span className="text-gray-400">📞</span>
                  <span>{clientDetail.phoneNumber}</span>
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-emerald-600 hover:border-emerald-300 dark:hover:text-emerald-400 transition-all shadow-2xs"
                  title="Edit client profile"
                >
                  <EditPen className="w-3 h-3 text-gray-400 hover:text-emerald-500" />
                  <span>Edit Profile</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-3 lg:justify-end shrink-0">
          {/* Summary Pills */}
          <div className="flex items-center divide-x divide-gray-200 dark:divide-gray-700/80 rounded-2xl border border-gray-200/70 dark:border-gray-700/80 bg-white/80 dark:bg-gray-800/80 shadow-2xs">
            <div className="px-4 py-1.5 text-center">
              <p className="text-sm font-extrabold text-gray-900 dark:text-white leading-none">
                {businesses.length}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">
                Portfolios
              </p>
            </div>
            <div className="px-4 py-1.5 text-center">
              <p className="text-sm font-extrabold text-gray-900 dark:text-white leading-none">
                {totalNumbers}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">
                Lines
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Child Portfolios Container */}
      {expanded && (
        <div className="p-4 sm:p-6 space-y-4 bg-gray-50/30 dark:bg-gray-900/20">
          {businesses.map((business) => (
            <PortfolioSubCard
              key={business.businessId}
              business={business}
              onViewDetails={() => onViewDetails(business)}
              onOpenConsole={onOpenConsole}
            />
          ))}
        </div>
      )}

      {/* Edit Client Modal */}
      {clientDetail && (
        <EditClientModal
          clientDetail={clientDetail}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
}
