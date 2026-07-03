"use client";

import React, { useMemo, useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/http";
import { buildBusinessHierarchy } from "@/modules/clients/utils";
import { useQuery } from "@tanstack/react-query";
import {
  BuildingIcon,
  ChatBubbleDotsIcon,
  CheckIcon,
  ChevronDownWideIcon,
  CloseIcon,
  CopyDuplicateIcon,
  FolderIcon,
  GlobeIcon,
  MessageDeliveredIcon,
  MessageReadIcon,
  MessageSentIcon,
  SearchIcon,
} from "@/icons";

/* -------------------------------------------------------------------------- */
/*                                   Types                                     */
/* -------------------------------------------------------------------------- */

export interface WabaAccount {
  id: string;
  name: string;
  currency: string;
  messageTemplateNamespace: string;
  accountReviewStatus: string;
  businessId: string;
  businessStatus: string;
  businessName: string;
  businessVerificationStatus: string;
  whatsappBusinessManagerMessagingLimit: string;
  ownershipType: string;
  primaryFundingId: string;
  timezoneId: string;
  paymentMethodAttached: boolean;
  isOnBizApp: boolean;
}

export interface PhoneNumber {
  id: string;
  phoneNumber: string;
  wabaId: string;
  verifiedName: string;
  qualityRating: string;
  messagingLimit: string;
  whatsappBusinessManagerMessagingLimit: string;
  isOfficialBusinessAccount: boolean;
  codeVerificationStatus: string;
  status: string;
  displayPhoneNumber: string;
  nameStatus: string;
  newName?: string;
  newNameStatus: string;
  decision: string;
  requestedVerifiedName: string;
  rejectionReason?: string;
  isOnBizApp: boolean;
}

export interface PagedResponse<T> {
  offset: number;
  limit: number;
  length: number;
  items: T[];
}

/* Derived hierarchy */
interface WabaNode extends WabaAccount {
  phoneNumbers: PhoneNumber[];
}

interface BusinessNode {
  businessId: string;
  businessName: string;
  businessStatus: string;
  businessVerificationStatus: string;
  wabas: WabaNode[];
  phoneCount: number;
}

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                    */
/* -------------------------------------------------------------------------- */

function formatTier(tier?: string): string {
  if (!tier) return "—";
  return tier.replace(/^TIER_/, "Tier ").replace(/_/g, " ");
}

function titleCase(value?: string): string {
  if (!value) return "—";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

type QualityMeta = { label: string; dot: string; text: string };

function qualityMeta(rating?: string): QualityMeta {
  switch (rating) {
    case "GREEN":
      return { label: "High", dot: "bg-success-500", text: "text-success-600 dark:text-success-400" };
    case "YELLOW":
      return { label: "Medium", dot: "bg-warning-500", text: "text-warning-600 dark:text-warning-400" };
    case "RED":
      return { label: "Low", dot: "bg-error-500", text: "text-error-600 dark:text-error-400" };
    default:
      return { label: "Unknown", dot: "bg-gray-400", text: "text-gray-500" };
  }
}

function statusMeta(status?: string): { label: string; dot: string } {
  const normalized = (status || "").toUpperCase();
  if (normalized === "CONNECTED" || normalized === "ACTIVE") {
    return { label: "Connected", dot: "bg-success-500" };
  }
  if (normalized === "PENDING" || normalized === "IN_PROGRESS") {
    return { label: titleCase(status), dot: "bg-warning-500" };
  }
  return { label: titleCase(status), dot: "bg-gray-400" };
}

/* Small reusable pill */
function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "info" }) {
  const tones = {
    neutral: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    success: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400",
    info: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}

/* Copy-to-clipboard button with transient confirmation */
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
      aria-label={copied ? "Copied" : `Copy ${label ?? "value"}`}
      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors ${copied
          ? "border-success-200 bg-success-50 text-success-600 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-400"
          : "border-gray-200 bg-white text-gray-400 hover:border-emerald-300 hover:text-emerald-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500 dark:hover:border-emerald-500/30 dark:hover:text-emerald-400"
        }`}
    >
      {copied ? (
        <CheckIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
      ) : (
        <CopyDuplicateIcon />
      )}
    </button>
  );
}

/* Monospace identifier paired with a copy button */
function CopyableId({ value, label }: { value: string; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="font-mono text-xs text-gray-600 dark:text-gray-300">{value}</span>
      <CopyButton value={value} label={label} />
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Page                                      */
/* -------------------------------------------------------------------------- */

function ClientsContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedBusiness, setExpandedBusiness] = useState<Record<string, boolean>>({});
  const [drawerBusinessId, setDrawerBusinessId] = useState<string | null>(null);
  const [consoleNumber, setConsoleNumber] = useState<PhoneNumber | null>(null);

  const { data: wabaData, isLoading: wabasLoading } = useQuery<PagedResponse<WabaAccount>>({
    queryKey: ["ycloud", "business-accounts"],
    queryFn: async () =>
      apiFetch<PagedResponse<WabaAccount>>("/integrations/ycloud/whatsapp/business-accounts"),
    refetchInterval: 30000,
  });

  const { data: phoneData, isLoading: phonesLoading } = useQuery<PagedResponse<PhoneNumber>>({
    queryKey: ["ycloud", "phone-numbers"],
    queryFn: async () =>
      apiFetch<PagedResponse<PhoneNumber>>(
        "/integrations/ycloud/whatsapp/phone-numbers?page=1&limit=10&includeTotal=false"
      ),
    refetchInterval: 30000,
  });

  const wabaPage = wabaData;
  const phonePage = phoneData;
  const isLoading = wabasLoading || phonesLoading;

  const businesses = useMemo(
    () => buildBusinessHierarchy(wabaPage?.items ?? [], phonePage?.items ?? []),
    [wabaPage, phonePage]
  );

  const filteredBusinesses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return businesses;
    return businesses.filter((b) => {
      if (b.businessName.toLowerCase().includes(q)) return true;
      if (b.businessId.includes(q)) return true;
      return b.wabas.some(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.id.includes(q) ||
          w.phoneNumbers.some(
            (p) => p.displayPhoneNumber.toLowerCase().includes(q) || p.phoneNumber.includes(q)
          )
      );
    });
  }, [businesses, searchQuery]);

  const drawerBusiness = businesses.find((b) => b.businessId === drawerBusinessId) ?? null;

  const toggleBusiness = (id: string) =>
    setExpandedBusiness((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-6 animate-fade-in pt-2">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-gray-100 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Clients</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Business accounts, their WhatsApp Business Accounts (WABAs), and registered phone numbers.
          </p>
        </div>
        <Link
          href="/onboarding"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm shadow-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
        >
          + Connect New WABA
        </Link>
      </div>

 

      {/* Search */}
      <div className="relative w-full sm:w-96">
        <input
          type="text"
          placeholder="Search business, WABA, or number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
        />
        <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
      </div>

      {/* Hierarchy as full-width grouped tables */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <p className="text-xs text-gray-400">Loading business accounts...</p>
        </div>
      ) : filteredBusinesses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600">
            <FolderIcon />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-4">No Business Accounts Found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mt-1 leading-relaxed">
            No accounts match your search. Adjust the filter or connect a new WABA.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredBusinesses.map((business) => (
            <BusinessTableCard
              key={business.businessId}
              business={business}
              open={expandedBusiness[business.businessId] ?? true}
              onToggle={() => toggleBusiness(business.businessId)}
              onViewDetails={() => setDrawerBusinessId(business.businessId)}
              onOpenConsole={(phone) => setConsoleNumber(phone)}
            />
          ))}
        </div>
      )}

      {/* Details Drawer */}
      {drawerBusiness && (
        <DetailsDrawer 
          business={drawerBusiness} 
          onClose={() => setDrawerBusinessId(null)}
          onOpenConsole={(phone) => setConsoleNumber(phone)}
        />
      )}

      {/* Console Drawer */}
      {consoleNumber && (
        <ConsoleDrawer
          phone={consoleNumber}
          onClose={() => setConsoleNumber(null)}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Business Account Table Card                        */
/* -------------------------------------------------------------------------- */

function BusinessTableCard({
  business,
  open,
  onToggle,
  onViewDetails,
  onOpenConsole,
}: {
  business: BusinessNode;
  open: boolean;
  onToggle: () => void;
  onViewDetails: () => void;
  onOpenConsole: (phone: PhoneNumber) => void;
}) {
  const verified = business.businessVerificationStatus?.toLowerCase() === "verified";

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
      {/* Business header — spread across full width */}
      <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div onClick={onToggle} className="flex flex-1 items-center gap-3 text-left cursor-pointer select-none">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <BuildingIcon />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900 dark:text-white truncate">{business.businessName}</h2>
              {verified ? <Pill tone="success">Verified</Pill> : <Pill>{titleCase(business.businessVerificationStatus)}</Pill>}
              <ChevronDownWideIcon
                className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              />
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Business ID</span>
              <CopyableId value={business.businessId} label="Business ID" />
            </div>
          </div>
        </div>

        {/* Right cluster: summary + action, pushed to far right */}
        <div className="flex items-center gap-3 lg:justify-end">
          <div className="flex items-center divide-x divide-gray-200 dark:divide-gray-700 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40">
            <div className="px-4 py-2 text-center">
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">{business.wabas.length}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mt-1">WABAs</p>
            </div>
            <div className="px-4 py-2 text-center">
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">{business.phoneCount}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mt-1">Numbers</p>
            </div>
          </div>
          <button
            onClick={onViewDetails}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:bg-emerald-50/20 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Full-width table */}
      {open && (
        <div className="overflow-x-auto border-t border-gray-100 dark:border-gray-800">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-5 py-3 w-[22%]">WABA Account</th>
                <th scope="col" className="px-5 py-3 w-[20%]">WABA ID</th>
                <th scope="col" className="px-5 py-3 w-[20%]">Phone Number</th>
                <th scope="col" className="px-5 py-3 text-center">Connection</th>
                <th scope="col" className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {business.wabas.map((waba) => {
                const rowCount = Math.max(waba.phoneNumbers.length, 1);
                const wabaVerified = waba.businessVerificationStatus?.toLowerCase() === "verified";
                const phones = waba.phoneNumbers.length > 0 ? waba.phoneNumbers : [null];

                return phones.map((phone, idx) => (
                  <tr
                    key={phone ? phone.id : `${waba.id}-empty`}
                    className={`${idx === 0 ? "border-t-2 border-gray-100 dark:border-gray-800" : "border-t border-dashed border-gray-100 dark:border-gray-800/60"} hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors`}
                  >
                    {idx === 0 && (
                      <>
                        <td rowSpan={rowCount} className="px-5 py-3 align-top">
                          <div className="flex items-start gap-2">
                            <GlobeIcon className="mt-0.5 text-emerald-500 shrink-0" />
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 dark:text-white">{waba.name}</p>
                              {wabaVerified && (
                                <span className="mt-1 inline-flex">
                                  <Pill tone="info">Verified</Pill>
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td rowSpan={rowCount} className="px-5 py-3 align-top">
                          <CopyableId value={waba.id} label="WABA ID" />
                        </td>
                      </>
                    )}

                    {/* Phone number */}
                    <td className="px-5 py-3">
                      {phone ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{phone.displayPhoneNumber}</span>
                          <CopyButton value={phone.displayPhoneNumber} label="phone number" />
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">No phone numbers</span>
                      )}
                    </td>

                    {/* Connection */}
                    <td className="px-5 py-3 text-center">
                      {phone ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
                          <span className={`h-1.5 w-1.5 rounded-full ${statusMeta(phone.status).dot}`} />
                          {statusMeta(phone.status).label}
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3 text-right">
                      {phone ? (
                        <button
                          onClick={() => onOpenConsole(phone)}
                          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:bg-emerald-50/20 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                          Console
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

/* -------------------------------------------------------------------------- */
/*                               Details Drawer                               */
/* -------------------------------------------------------------------------- */

function DetailsDrawer({
  business,
  onClose,
  onOpenConsole,
}: {
  business: BusinessNode;
  onClose: () => void;
  onOpenConsole: (phone: PhoneNumber) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden />
      <div className="relative h-full w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-slide-in-right">
        {/* header */}
        <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{business.businessName}</h2>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Business ID</span>
              <CopyableId value={business.businessId} label="Business ID" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              {business.businessVerificationStatus?.toLowerCase() === "verified" ? (
                <Pill tone="success">Verified</Pill>
              ) : (
                <Pill>{titleCase(business.businessVerificationStatus)}</Pill>
              )}
              <span className="text-[11px] font-semibold text-gray-400">
                {business.wabas.length} WABA{business.wabas.length !== 1 ? "s" : ""} • {business.phoneCount} Number{business.phoneCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">WABA Accounts</p>
          {business.wabas.map((waba) => (
            <div key={waba.id} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 p-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">{waba.name}</h3>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">WABA ID</span>
                <CopyableId value={waba.id} label="WABA ID" />
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <Pill tone="success">{titleCase(waba.accountReviewStatus)}</Pill>
                <Pill>{formatTier(waba.whatsappBusinessManagerMessagingLimit)}</Pill>
              </div>

              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-4 mb-2">Phone Numbers</p>
              <div className="space-y-2.5">
                {waba.phoneNumbers.length === 0 ? (
                  <p className="text-[11px] text-gray-400">No phone numbers registered.</p>
                ) : (
                  waba.phoneNumbers.map((phone) => {
                    const s = statusMeta(phone.status);
                    const q = qualityMeta(phone.qualityRating);
                    return (
                      <div
                        key={phone.id}
                        className="flex flex-col gap-2 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 min-w-0">
                            <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white truncate">{phone.displayPhoneNumber}</span>
                            <CopyButton value={phone.displayPhoneNumber} label="phone number" />
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                              <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                              {s.label}
                            </span>
                            <span className="text-gray-300 dark:text-gray-600">•</span>
                            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${q.text}`}>
                              {q.label} Quality
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-end border-t border-gray-50 dark:border-gray-800/40 pt-2 mt-1">
                          <button
                            onClick={() => {
                              onClose();
                              onOpenConsole(phone);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:bg-emerald-50/20 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          >
                            Open Console
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Console Drawer                               */
/* -------------------------------------------------------------------------- */

interface CustomerRecord {
  customerNumber: string;
  customerName: string | null;
}

interface MessageRecord {
  id: string;
  wamid: string | null;
  customerNumber: string;
  customerName: string | null;
  direction: "INBOUND" | "OUTBOUND";
  messageType: string | null;
  messageText: string | null;
  status: string;
  sendTime: string | null;
  createdOn: string;
}

function ConsoleDrawer({
  phone,
  onClose,
}: {
  phone: PhoneNumber;
  onClose: () => void;
}) {
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");

  // Query unique customers from database
  const { data: customers, isLoading: loadingCustomers } = useQuery<CustomerRecord[]>({
    queryKey: ["whatsapp", "customers", phone.id],
    queryFn: () => apiFetch<CustomerRecord[]>(`/whatsapp/numbers/${phone.id}/customers`),
    refetchInterval: 10000,
  });

  // Query logs for active customer connection
  const { data: messages, isLoading: loadingMessages } = useQuery<MessageRecord[]>({
    queryKey: ["whatsapp", "messages", phone.id, selectedCustomer],
    queryFn: () =>
      apiFetch<MessageRecord[]>(
        `/whatsapp/numbers/${phone.id}/messages?customerNumber=${encodeURIComponent(
          selectedCustomer || ""
        )}`
      ),
    enabled: !!selectedCustomer,
    refetchInterval: 5000,
  });

  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.customerNumber.toLowerCase().includes(q) ||
        (c.customerName && c.customerName.toLowerCase().includes(q))
    );
  }, [customers, customerSearch]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      {/* Panel */}
      <div className="relative h-full w-full max-w-4xl bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              WhatsApp Message Console
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Monitoring line: <span className="font-mono font-semibold">{phone.displayPhoneNumber}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content split panel */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel: Customers list */}
          <div className="w-[35%] border-r border-gray-100 dark:border-gray-800 flex flex-col bg-gray-50/50 dark:bg-gray-950/20">
            {/* Search */}
            <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                />
                <SearchIcon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loadingCustomers ? (
                <div className="flex flex-col gap-2 p-3">
                  <div className="h-10 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
                  <div className="h-10 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-10 px-3 text-xs text-gray-400">
                  No active customers found.
                </div>
              ) : (
                filteredCustomers.map((customer) => {
                  const isActive = selectedCustomer === customer.customerNumber;
                  return (
                    <button
                      key={customer.customerNumber}
                      onClick={() => setSelectedCustomer(customer.customerNumber)}
                      className={`w-full flex flex-col text-left px-3 py-2.5 rounded-xl transition-all duration-150 ${
                        isActive
                          ? "bg-emerald-500 text-white shadow-sm"
                          : "hover:bg-gray-100/70 dark:hover:bg-gray-800/40 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <span className="font-semibold text-xs truncate">
                        {customer.customerName || "Unknown Customer"}
                      </span>
                      <span
                        className={`font-mono text-[10px] mt-0.5 ${
                          isActive ? "text-emerald-100" : "text-gray-400"
                        }`}
                      >
                        {customer.customerNumber}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right panel: Timeline */}
          <div className="w-[65%] flex flex-col bg-white dark:bg-gray-900">
            {selectedCustomer ? (
              <>
                {/* Chat header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                  <div>
                    <h3 className="font-bold text-xs text-gray-900 dark:text-white">
                      {customers?.find((c) => c.customerNumber === selectedCustomer)?.customerName ||
                        "Unknown"}
                    </h3>
                    <p className="font-mono text-[10px] text-gray-400 mt-0.5">{selectedCustomer}</p>
                  </div>
                  <CopyButton value={selectedCustomer} label="customer number" />
                </div>

                {/* Chat logs */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30 dark:bg-gray-950/5">
                  {loadingMessages && !messages ? (
                    <div className="flex flex-col gap-3 py-4">
                      <div className="h-12 w-2/3 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                      <div className="h-12 w-2/3 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse align-self-end ml-auto" />
                    </div>
                  ) : messages?.length === 0 ? (
                    <div className="text-center py-20 text-xs text-gray-400">
                      No logs found for this conversation.
                    </div>
                  ) : (
                    messages?.map((msg) => {
                      const isOutbound = msg.direction === "OUTBOUND";
                      const time = new Date(msg.createdOn).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      const date = new Date(msg.createdOn).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      });

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col max-w-[80%] ${
                            isOutbound ? "ml-auto items-end" : "mr-auto items-start"
                          }`}
                        >
                          <div
                            className={`px-3.5 py-2.5 rounded-2xl shadow-sm text-xs leading-relaxed ${
                              isOutbound
                                ? "bg-emerald-500 text-white rounded-tr-none"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-tl-none"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.messageText}</p>
                          </div>
                          <span className="text-[9px] text-gray-400 mt-1 flex items-center gap-1">
                            <span>{date}, {time}</span>
                            {isOutbound && (
                              <span className="flex items-center">
                                {msg.status === "READ" ? (
                                  <MessageReadIcon className="text-emerald-500 dark:text-emerald-400" />
                                ) : msg.status === "DELIVERED" ? (
                                  <MessageDeliveredIcon />
                                ) : (
                                  <MessageSentIcon />
                                )}
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-400">
                <ChatBubbleDotsIcon className="text-gray-300 mb-2" />
                <p className="text-xs">Select a customer connection on the left to view message logs.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[80vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      }
    >
      <ClientsContent />
    </Suspense>
  );
}
