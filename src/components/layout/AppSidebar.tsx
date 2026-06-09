"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import DataDeletionLink from "@/components/common/DataDeletionLink";
import PrivacyPolicyLink from "@/components/common/PrivacyPolicyLink";
import TermsOfServiceLink from "@/components/common/TermsOfServiceLink";
import { useSidebar } from "@/context/SidebarContext";
import { PAGE_ROUTES } from "@/lib/constants";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string }[];
};

// SVG icon components
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);

const ClientsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const OnboardingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10" />
    <path d="M16 16l4 4m0-4l-4 4" />
    <path d="M9 11l2 2 4-4" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
  </svg>
);

const RolesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const WebhooksIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const AuditIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const PolicyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const TermsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 14l2 2 4-4" />
  </svg>
);

const DeletionIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const navItems: NavItem[] = [
  { name: "Dashboard", icon: <DashboardIcon />, path: PAGE_ROUTES.DASHBOARD },
  { name: "Clients",   icon: <ClientsIcon />,   path: PAGE_ROUTES.CLIENTS },
  { name: "Onboarding", icon: <OnboardingIcon />, path: PAGE_ROUTES.ONBOARDING },
];

const managementItems: NavItem[] = [
  { name: "Users",      icon: <UsersIcon />,    path: PAGE_ROUTES.USERS },
  { name: "Roles",      icon: <RolesIcon />,    path: PAGE_ROUTES.ROLES },
  { name: "Webhooks",   icon: <WebhooksIcon />, path: PAGE_ROUTES.WEBHOOKS },
  { name: "Audit Logs", icon: <AuditIcon />,    path: PAGE_ROUTES.AUDIT_LOGS },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const pathname = usePathname();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const isActive = (path?: string) => pathname === path;
  const show = isExpanded;

  // Icon box wrapper — gray bg normally, brand blue when active
  const iconBox = (active: boolean) =>
    `flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-colors duration-200 ${
      active
        ? "bg-emerald-500 text-white shadow-sm"
        : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 dark:group-hover:bg-gray-600 dark:group-hover:text-gray-300"
    }`;

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="space-y-1">
      {items.map((item) => {
        const active = isActive(item.path);
        return (
          <li key={item.name}>
            {item.subItems ? (
              <div>
                <button
                  onClick={() => setExpandedItem(expandedItem === item.name ? null : item.name)}
                  className="group w-full flex items-center gap-3 px-2 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                >
                  <span className={iconBox(false)}>{item.icon}</span>
                  {show && <span className="flex-1 text-left">{item.name}</span>}
                  {show && (
                    <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedItem === item.name ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                    </svg>
                  )}
                </button>
                {expandedItem === item.name && show && (
                  <ul className="mt-1 ml-12 space-y-1">
                    {item.subItems.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          href={subItem.path}
                          className={`block px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                            isActive(subItem.path)
                              ? "text-brand-600 dark:text-brand-400 font-semibold"
                              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <Link
                href={item.path || "#"}
                title={!show ? item.name : undefined}
                className={`group flex items-center gap-3 px-2 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-emerald-50 dark:bg-gray-700 shadow-sm text-emerald-700 dark:text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                } ${!show ? "justify-center" : ""}`}
              >
                <span className={iconBox(active)}>{item.icon}</span>
                {show && <span>{item.name}</span>}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      <aside
        className={`relative flex-shrink-0 hidden lg:flex flex-col h-screen bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isExpanded ? "w-64" : "w-[72px]"
        }`}
      >
        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="group hidden lg:flex absolute -right-3.5 top-20 z-50 w-7 h-7 items-center justify-center rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md dark:hover:bg-gray-600 transition-all duration-200 hover:scale-110"
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <svg
            className={`w-3.5 h-3.5 text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 transition-transform duration-300 ${isExpanded ? "" : "rotate-180"}`}
            fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200/20 dark:border-gray-700 shrink-0 bg-gradient-to-r from-[#128C7E] to-[#25D366] dark:from-[#0d2d2a] dark:to-[#0f3d30]">
          {show ? (
            <Image src="/images/logo/logo-dark.svg" alt="WhatsApp Hub" width={160} height={36} priority />
          ) : (
            <Image src="/images/logo/logo-icon.svg" alt="WhatsApp Hub" width={36} height={36} priority />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          <div>
            {show && <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2 mb-2">Main</p>}
            {renderMenuItems(navItems)}
          </div>
          <div>
            {show && <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2 mb-2">Management</p>}
            {renderMenuItems(managementItems)}
          </div>
        </nav>

        {/* Settings pinned at bottom */}
        <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <Link
            href={PAGE_ROUTES.SETTINGS}
            title={!show ? "Settings" : undefined}
            className={`group flex items-center gap-3 px-2 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive(PAGE_ROUTES.SETTINGS)
                ? "bg-emerald-50 dark:bg-gray-700 shadow-sm text-emerald-700 dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-gray-700 dark:hover:text-gray-100"
            } ${!show ? "justify-center" : ""}`}
          >
            <span className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-colors duration-200 ${isActive(PAGE_ROUTES.SETTINGS) ? "bg-emerald-500 text-white shadow-sm" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-600"}`}>
              <SettingsIcon />
            </span>
            {show && <span>Settings</span>}
          </Link>
          <div className={`mt-3 space-y-1 px-2 ${show ? "" : "flex flex-col items-center"}`}>
            {show ? (
              <>
                <TermsOfServiceLink className="block text-xs text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400" />
                <PrivacyPolicyLink className="block text-xs text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400" />
                <DataDeletionLink
                  label="Data Deletion"
                  className="block text-xs text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
                />
              </>
            ) : (
              <>
                <Link
                  href={PAGE_ROUTES.TERMS}
                  title="Terms of Service"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-emerald-400"
                >
                  <TermsIcon />
                </Link>
                <Link
                  href={PAGE_ROUTES.PRIVACY}
                  title="Privacy Policy"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-emerald-400"
                >
                  <PolicyIcon />
                </Link>
                <Link
                  href={PAGE_ROUTES.DATA_DELETION}
                  title="Data Deletion Instructions"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-emerald-400"
                >
                  <DeletionIcon />
                </Link>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 flex flex-col lg:hidden transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center h-16 px-4 border-b border-gray-200/20 dark:border-gray-700 shrink-0 bg-gradient-to-r from-[#128C7E] to-[#25D366] dark:from-[#0d2d2a] dark:to-[#0f3d30]">
          <Image src="/images/logo/logo-dark.svg" alt="WhatsApp Hub" width={160} height={36} priority />
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Main</p>
            {renderMenuItems(navItems)}
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Management</p>
            {renderMenuItems(managementItems)}
          </div>
        </nav>
        <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <Link
            href={PAGE_ROUTES.SETTINGS}
            className={`group flex items-center gap-3 px-2 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive(PAGE_ROUTES.SETTINGS)
                ? "bg-emerald-50 dark:bg-gray-700 shadow-sm text-emerald-700 dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-gray-700 dark:hover:text-gray-100"
            }`}
          >
            <span className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${isActive(PAGE_ROUTES.SETTINGS) ? "bg-emerald-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600"}`}>
              <SettingsIcon />
            </span>
            <span>Settings</span>
          </Link>
          <div className="mt-3 space-y-1 px-2">
            <TermsOfServiceLink className="block text-xs text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400" />
            <PrivacyPolicyLink className="block text-xs text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400" />
            <DataDeletionLink
              label="Data Deletion"
              className="block text-xs text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
            />
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
