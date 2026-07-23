"use client";

import React, { useState } from "react";
import type { BusinessNode, PhoneNumber } from "@/modules/clients/types";
import {
  BriefcaseBusinessIcon as BriefcaseBusiness,
  ChevronDownIcon as ChevronDown,
  EyeIcon as Eye,
  MessageSquareIcon as MessageSquare,
  SmartphoneIcon as Smartphone,
  WhatsAppIcon,
  CheckIcon as Check,
  CopyDuplicateIcon as Copy,
} from "@/icons";

export type { BusinessNode, PhoneNumber };

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                   */
/* -------------------------------------------------------------------------- */

function titleCase(value?: string): string {
  if (!value) return "—";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function statusMeta(status?: string): { label: string; dot: string } {
  const normalized = (status || "").toUpperCase();
  if (normalized === "CONNECTED" || normalized === "ACTIVE") {
    return { label: "Connected", dot: "bg-emerald-500" };
  }
  if (normalized === "PENDING" || normalized === "IN_PROGRESS") {
    return { label: titleCase(status), dot: "bg-amber-500" };
  }
  return { label: titleCase(status), dot: "bg-gray-400" };
}

function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "info";
}) {
  const tones = {
    neutral:
      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50",
    success:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20",
    info:
      "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400 border border-teal-200/60 dark:border-teal-500/20",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function CopyableId({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* noop */
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
      <span>{value}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors p-0.5"
        title={copied ? "Copied!" : `Copy ${label}`}
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </span>
  );
}

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* noop */
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Copied!" : `Copy ${label ?? "value"}`}
      className="text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors p-0.5"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Component                                   */
/* -------------------------------------------------------------------------- */

export default function PortfolioSubCard({
  business,
  defaultOpen = true,
  onViewDetails,
  onOpenConsole,
}: {
  business: BusinessNode;
  defaultOpen?: boolean;
  onViewDetails: () => void;
  onOpenConsole: (phone: PhoneNumber) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const verified = business.businessVerificationStatus?.toLowerCase() === "verified";

  return (
    <div className="rounded-2xl border border-gray-200/80 dark:border-gray-700/70 bg-white dark:bg-gray-800/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Portfolio Header */}
      <div className="flex flex-col gap-3 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between border-b border-gray-100 dark:border-gray-700/60 bg-gray-50/40 dark:bg-gray-800/40">
        <div
          onClick={() => setOpen(!open)}
          className="flex flex-1 items-center gap-3 text-left cursor-pointer select-none"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
            <BriefcaseBusiness className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {business.businessName}
              </h3>
              {verified ? (
                <Pill tone="success">Verified</Pill>
              ) : (
                <Pill>{titleCase(business.businessVerificationStatus)}</Pill>
              )}
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Business ID
              </span>
              <CopyableId value={business.businessId} label="Business ID" />
            </div>
          </div>
        </div>

        {/* Right summary + action */}
        <div className="flex items-center gap-3 lg:justify-end">
          <div className="flex items-center divide-x divide-gray-200 dark:divide-gray-700/80 rounded-xl border border-gray-200/70 dark:border-gray-700/80 bg-white dark:bg-gray-900/60 shadow-2xs">
            <div className="px-3.5 py-1 text-center">
              <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">
                {business.wabas.length}
              </p>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400 mt-0.5">
                WABAs
              </p>
            </div>
            <div className="px-3.5 py-1 text-center">
              <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">
                {business.phoneCount}
              </p>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400 mt-0.5">
                Numbers
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onViewDetails}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-500/40 hover:bg-emerald-50/30 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-gray-400" />
            <span>Details</span>
          </button>
        </div>
      </div>

      {/* WABAs Table */}
      {open && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] border-collapse text-left text-xs">
            <thead className="bg-gray-50/80 dark:bg-gray-900/60 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-700/80">
              <tr>
                <th scope="col" className="px-4 py-2.5 w-[24%]">
                  WABA Account
                </th>
                <th scope="col" className="px-4 py-2.5 w-[22%]">
                  WABA ID
                </th>
                <th scope="col" className="px-4 py-2.5 w-[24%]">
                  Phone Number
                </th>
                <th scope="col" className="px-4 py-2.5 text-center">
                  Status
                </th>
                <th scope="col" className="px-4 py-2.5 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
              {business.wabas.map((waba) => {
                const rowCount = Math.max(waba.phoneNumbers.length, 1);
                const wabaVerified =
                  waba.businessVerificationStatus?.toLowerCase() === "verified";
                const phones = waba.phoneNumbers.length > 0 ? waba.phoneNumbers : [null];

                return phones.map((phone, idx) => (
                  <tr
                    key={phone ? phone.id : `${waba.id}-empty`}
                    className="hover:bg-emerald-50/30 dark:hover:bg-emerald-500/5 transition-colors"
                  >
                    {idx === 0 && (
                      <>
                        <td rowSpan={rowCount} className="px-4 py-3 align-middle">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                              <WhatsAppIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 dark:text-white leading-snug truncate">
                                {waba.name}
                              </p>
                              {wabaVerified && (
                                <span className="mt-0.5 inline-flex">
                                  <Pill tone="info">Verified</Pill>
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td rowSpan={rowCount} className="px-4 py-3 align-middle">
                          <CopyableId value={waba.id} label="WABA ID" />
                        </td>
                      </>
                    )}

                    {/* Phone number */}
                    <td className="px-4 py-3 align-middle">
                      {phone ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white">
                            {phone.displayPhoneNumber}
                          </span>
                          <CopyButton value={phone.displayPhoneNumber} label="phone number" />
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-[11px]">No numbers</span>
                      )}
                    </td>

                    {/* Connection Status */}
                    <td className="px-4 py-3 text-center align-middle">
                      {phone ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/60 px-2 py-0.5 rounded-full border border-gray-200/60 dark:border-gray-700">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              statusMeta(phone.status).dot
                            } animate-pulse`}
                          />
                          {statusMeta(phone.status).label}
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right align-middle">
                      {phone ? (
                        <button
                          type="button"
                          onClick={() => onOpenConsole(phone)}
                          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border border-emerald-200/80 dark:border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-500/10 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white text-xs font-semibold text-emerald-700 dark:text-emerald-400 transition-all shadow-2xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Messages</span>
                        </button>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
