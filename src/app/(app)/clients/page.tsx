"use client";

import React, { useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/http";
import { buildBusinessHierarchy } from "@/modules/clients/utils";
import { useQuery } from "@tanstack/react-query";
import type {
  WabaAccount,
  PhoneNumber,
  PagedResponse,
  BusinessNode,
} from "@/modules/clients/types";
import {
  BriefcaseBusinessIcon as BriefcaseBusiness,
  CheckIcon as Check,
  ChevronDownIcon as ChevronDown,
  CloseIcon as X,
  CopyDuplicateIcon as Copy,
  EyeIcon as Eye,
  FolderOpenIcon as FolderOpen,
  MessageCircleIcon as MessageCircle,
  MessageSquareIcon as MessageSquare,
  PlusIcon as Plus,
  SearchIcon as Search,
  SmartphoneIcon as Smartphone,
} from "@/icons";
import { EMPTY_STATE_COPY } from "@/lib/constants";
import ClientGroupCard, { ClientDetailMeta } from "@/components/clients/ClientGroupCard";
import PortfolioSubCard from "@/components/clients/PortfolioSubCard";

export interface GroupedClientNode {
  clientDetail: ClientDetailMeta | null;
  businesses: BusinessNode[];
}

interface DbClient {
  id: string;
  name: string;
  wabaId: string;
  clientDetail?: ClientDetailMeta | null;
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

function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "info" }) {
  const tones = {
    neutral: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50",
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20",
    info: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400 border border-teal-200/60 dark:border-teal-500/20",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide ${tones[tone]}`}>
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
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Main Page Component                           */
/* -------------------------------------------------------------------------- */

function ClientsContent() {
  const [searchQuery, setSearchQuery] = useState("");
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

  const { data: dbClients, refetch: refetchDbClients } = useQuery<DbClient[]>({
    queryKey: ["db", "clients"],
    queryFn: async () => apiFetch<DbClient[]>("/whatsapp/clients"),
    refetchInterval: 30000,
  });

  const isLoading = wabasLoading || phonesLoading;

  const businesses = useMemo(
    () => buildBusinessHierarchy(wabaData?.items ?? [], phoneData?.items ?? []),
    [wabaData, phoneData]
  );

  // Group businesses by parent ClientDetail
  const groupedClientNodes = useMemo<GroupedClientNode[]>(() => {
    if (!businesses || businesses.length === 0) return [];

    const mapByClientDetailId = new Map<string, GroupedClientNode>();
    const unlinkedBusinesses: BusinessNode[] = [];

    for (const business of businesses) {
      const matchedDbC = dbClients?.find((dbC) =>
        business.wabas.some((waba) => waba.id === dbC.wabaId)
      );

      if (matchedDbC?.clientDetail) {
        const cd = matchedDbC.clientDetail;
        const existing = mapByClientDetailId.get(cd.id) ?? {
          clientDetail: cd,
          businesses: [],
        };
        existing.businesses.push(business);
        mapByClientDetailId.set(cd.id, existing);
      } else {
        unlinkedBusinesses.push(business);
      }
    }

    const result = Array.from(mapByClientDetailId.values());
    if (unlinkedBusinesses.length > 0) {
      result.push({
        clientDetail: null,
        businesses: unlinkedBusinesses,
      });
    }

    return result;
  }, [businesses, dbClients]);

  // Filter groups by searchQuery
  const filteredGroups = useMemo<GroupedClientNode[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return groupedClientNodes;

    return groupedClientNodes
      .map((group) => {
        const cd = group.clientDetail;
        const matchesClientHeader =
          cd &&
          (cd.name.toLowerCase().includes(q) ||
            cd.email.toLowerCase().includes(q) ||
            cd.phoneNumber.includes(q) ||
            (cd.companyName && cd.companyName.toLowerCase().includes(q)));

        if (matchesClientHeader) {
          return group;
        }

        const matchingBusinesses = group.businesses.filter((b: BusinessNode) => {
          if (b.businessName.toLowerCase().includes(q)) return true;
          if (b.businessId.includes(q)) return true;
          return b.wabas.some(
            (w) =>
              w.name.toLowerCase().includes(q) ||
              w.id.includes(q) ||
              w.phoneNumbers.some(
                (p) =>
                  p.displayPhoneNumber.toLowerCase().includes(q) ||
                  p.phoneNumber.includes(q)
              )
          );
        });

        if (matchingBusinesses.length > 0) {
          return {
            ...group,
            businesses: matchingBusinesses,
          };
        }

        return null;
      })
      .filter((g): g is GroupedClientNode => g !== null);
  }, [groupedClientNodes, searchQuery]);

  const drawerBusiness = businesses.find((b) => b.businessId === drawerBusinessId) ?? null;

  return (
    <div className="space-y-6 animate-fade-in pt-2">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-gray-100 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <span>Clients & Business Portfolios</span>
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            Manage your parent client entities, Meta business portfolios, and WhatsApp numbers.
          </p>
        </div>
        <Link
          href="/onboarding"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Connect New WABA</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <input
          type="text"
          placeholder="Search client name, email, business ID, or phone number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800/80 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
        />
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      </div>

      {/* Main Data Render */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <p className="text-xs text-gray-400">{EMPTY_STATE_COPY.clients.loading}</p>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500">
            <FolderOpen className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-4">{EMPTY_STATE_COPY.clients.title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mt-1 leading-relaxed">
            {EMPTY_STATE_COPY.clients.description}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredGroups.map((group, idx) => (
            <ClientGroupCard
              key={group.clientDetail?.id || `unlinked-${idx}`}
              clientDetail={group.clientDetail}
              businesses={group.businesses}
              onViewDetails={(b: BusinessNode) => setDrawerBusinessId(b.businessId)}
              onOpenConsole={(phone: PhoneNumber) => setConsoleNumber(phone)}
              onRefresh={() => {
                void refetchDbClients();
              }}
            />
          ))}
        </div>
      )}

      {/* Details Drawer */}
      {drawerBusiness && (
        <DetailsDrawer
          business={drawerBusiness}
          clientDetail={
            dbClients?.find((dbC) =>
              drawerBusiness.wabas.some((waba) => waba.id === dbC.wabaId)
            )?.clientDetail
          }
          onClose={() => setDrawerBusinessId(null)}
          onOpenConsole={(phone: PhoneNumber) => setConsoleNumber(phone)}
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
/*                               Details Drawer                               */
/* -------------------------------------------------------------------------- */

function DetailsDrawer({
  business,
  clientDetail,
  onClose,
  onOpenConsole,
}: {
  business: BusinessNode;
  clientDetail?: ClientDetailMeta | null;
  onClose: () => void;
  onOpenConsole: (phone: PhoneNumber) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden />
      <div className="relative h-full w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
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
            type="button"
            onClick={onClose}
            className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {clientDetail && (
            <div className="rounded-2xl border border-emerald-100 dark:border-emerald-500/10 bg-emerald-50/20 dark:bg-emerald-500/5 p-4 space-y-3 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Client / Owner Profile
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact Person</p>
                  <p className="font-bold text-gray-900 dark:text-white mt-0.5">{clientDetail.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                  <p className="font-medium text-gray-700 dark:text-gray-300 mt-0.5">{clientDetail.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</p>
                  <p className="font-mono text-gray-700 dark:text-gray-300 mt-0.5">{clientDetail.phoneNumber}</p>
                </div>
                {clientDetail.companyName && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Company Name</p>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">{clientDetail.companyName}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">WABA Accounts</p>
          {business.wabas.map((waba) => (
            <div key={waba.id} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 p-4">
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
                  waba.phoneNumbers.map((phone) => (
                    <div
                      key={phone.id}
                      className="flex flex-col gap-2 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-2 min-w-0">
                          <Smartphone className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white truncate">{phone.displayPhoneNumber}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenConsole(phone);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                        >
                          Messages
                        </button>
                      </div>
                    </div>
                  ))
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

function ConsoleDrawer({
  phone,
  onClose,
}: {
  phone: PhoneNumber;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden />
      <div className="relative h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-slide-in-right p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Line Console</h3>
          <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 space-y-2 text-xs">
          <p className="font-bold text-gray-900 dark:text-white">Phone: {phone.displayPhoneNumber}</p>
          <p className="text-gray-500 font-mono">WABA ID: {phone.wabaId}</p>
        </div>
        <Link
          href={`/messages?phoneId=${encodeURIComponent(phone.id)}`}
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Go to Send Message Studio</span>
        </Link>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-gray-400 animate-pulse">Loading clients dashboard...</div>}>
      <ClientsContent />
    </Suspense>
  );
}
