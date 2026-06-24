"use client";

import React, { useMemo, useState, Suspense, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";
import Link from "next/link";
import { mockWabaPage, mockPhonePage } from "./clients.mock";

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
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 8V6a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2h-2M6 8h8a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8a2 2 0 012-2z" />
        </svg>
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
/*                              Data Aggregation                              */
/* -------------------------------------------------------------------------- */

function buildHierarchy(wabas: WabaAccount[], phones: PhoneNumber[]): BusinessNode[] {
  const phonesByWaba = new Map<string, PhoneNumber[]>();
  for (const phone of phones) {
    const list = phonesByWaba.get(phone.wabaId) ?? [];
    list.push(phone);
    phonesByWaba.set(phone.wabaId, list);
  }

  const businessMap = new Map<string, BusinessNode>();
  for (const waba of wabas) {
    const node = businessMap.get(waba.businessId) ?? {
      businessId: waba.businessId,
      businessName: waba.businessName,
      businessStatus: waba.businessStatus,
      businessVerificationStatus: waba.businessVerificationStatus,
      wabas: [],
      phoneCount: 0,
    };
    const phoneNumbers = phonesByWaba.get(waba.id) ?? [];
    node.wabas.push({ ...waba, phoneNumbers });
    node.phoneCount += phoneNumbers.length;
    businessMap.set(waba.businessId, node);
  }

  return Array.from(businessMap.values());
}

/* -------------------------------------------------------------------------- */
/*                                   Page                                      */
/* -------------------------------------------------------------------------- */

function ClientsContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedBusiness, setExpandedBusiness] = useState<Record<string, boolean>>({});
  const [drawerBusinessId, setDrawerBusinessId] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false);

  useEffect(() => {
    setTestMode(localStorage.getItem("clientsTestMode") === "true");
  }, []);

  const toggleTestMode = () => {
    setTestMode((prev) => {
      const next = !prev;
      localStorage.setItem("clientsTestMode", String(next));
      return next;
    });
  };

  const { data: wabaData, isLoading: wabasLoading } = useQuery<PagedResponse<WabaAccount>>({
    queryKey: ["ycloud", "business-accounts"],
    queryFn: async () =>
      apiFetch<PagedResponse<WabaAccount>>("/integrations/ycloud/whatsapp/business-accounts"),
    refetchInterval: 30000,
    enabled: !testMode,
  });

  const { data: phoneData, isLoading: phonesLoading } = useQuery<PagedResponse<PhoneNumber>>({
    queryKey: ["ycloud", "phone-numbers"],
    queryFn: async () =>
      apiFetch<PagedResponse<PhoneNumber>>(
        "/integrations/ycloud/whatsapp/phone-numbers?page=1&limit=10&includeTotal=false"
      ),
    refetchInterval: 30000,
    enabled: !testMode,
  });

  const wabaPage = testMode ? mockWabaPage : wabaData;
  const phonePage = testMode ? mockPhonePage : phoneData;
  const isLoading = !testMode && (wabasLoading || phonesLoading);

  const businesses = useMemo(
    () => buildHierarchy(wabaPage?.items ?? [], phonePage?.items ?? []),
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

  const totals = useMemo(() => {
    const wabaCount = businesses.reduce((acc, b) => acc + b.wabas.length, 0);
    const phoneCount = businesses.reduce((acc, b) => acc + b.phoneCount, 0);
    const connected = businesses.reduce(
      (acc, b) =>
        acc +
        b.wabas.reduce(
          (a, w) => a + w.phoneNumbers.filter((p) => p.status === "CONNECTED").length,
          0
        ),
      0
    );
    return { businessCount: businesses.length, wabaCount, phoneCount, connected };
  }, [businesses]);

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
      <button
        onClick={toggleTestMode}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${testMode
            ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400"
            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-emerald-300"
          }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${testMode ? "bg-amber-500 animate-pulse" : "bg-gray-400"}`} />
        {testMode ? "Test Mode: ON" : "Test Mode: OFF"}
      </button>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Business Accounts</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{totals.businessCount}</p>
        </div>
        <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">WABA Accounts</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{totals.wabaCount}</p>
        </div>
        <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone Numbers</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{totals.phoneCount}</p>
        </div>
        <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Connected</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="h-2 w-2 rounded-full bg-success-500" />
            <p className="text-xl font-bold text-gray-900 dark:text-white">{totals.connected}</p>
          </div>
        </div>
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
        <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
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
            <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
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
            />
          ))}
        </div>
      )}

      {/* Details Drawer */}
      {drawerBusiness && (
        <DetailsDrawer business={drawerBusiness} onClose={() => setDrawerBusinessId(null)} />
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
}: {
  business: BusinessNode;
  open: boolean;
  onToggle: () => void;
  onViewDetails: () => void;
}) {
  const verified = business.businessVerificationStatus?.toLowerCase() === "verified";

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
      {/* Business header — spread across full width */}
      <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <button onClick={onToggle} className="flex flex-1 items-center gap-3 text-left">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m4-14h2m-2 4h2m4-4h2m-2 4h2" />
            </svg>
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900 dark:text-white truncate">{business.businessName}</h2>
              {verified ? <Pill tone="success">Verified</Pill> : <Pill>{titleCase(business.businessVerificationStatus)}</Pill>}
              <svg
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Business ID</span>
              <CopyableId value={business.businessId} label="Business ID" />
            </div>
          </div>
        </button>

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
                            <svg className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M11.5 3a17 17 0 000 18M12.5 3a17 17 0 010 18" />
                            </svg>
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

function DetailsDrawer({ business, onClose }: { business: BusinessNode; onClose: () => void }) {
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
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
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
              <div className="space-y-2">
                {waba.phoneNumbers.length === 0 ? (
                  <p className="text-[11px] text-gray-400">No phone numbers registered.</p>
                ) : (
                  waba.phoneNumbers.map((phone) => {
                    const s = statusMeta(phone.status);
                    const q = qualityMeta(phone.qualityRating);
                    return (
                      <div
                        key={phone.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2"
                      >
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
