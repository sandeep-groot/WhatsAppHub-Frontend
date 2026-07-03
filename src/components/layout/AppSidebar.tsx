"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import DataDeletionLink from "@/components/common/DataDeletionLink";
import PrivacyPolicyLink from "@/components/common/PrivacyPolicyLink";
import TermsOfServiceLink from "@/components/common/TermsOfServiceLink";
import { useSidebar } from "@/context/SidebarContext";
import {
  DeletionIcon,
  PolicyIcon,
  ChevronDownIcon,
  SidebarCollapseIcon,
  TermsIcon,
} from "@/icons";
import { APP_CONFIG, FOOTER_LINK_LABELS, NAV_SECTION_LABELS, PAGE_ROUTES } from "@/lib/constants";
import { MAIN_NAV_ITEMS, MANAGEMENT_NAV_ITEMS } from "@/config/navigation";
import { resolveNavIcon } from "@/config/nav-icons";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string }[];
};

const navItems: NavItem[] = MAIN_NAV_ITEMS.map((item) => ({
  ...item,
  icon: resolveNavIcon(item.icon),
}));

const managementItems: NavItem[] = MANAGEMENT_NAV_ITEMS.map((item) => ({
  ...item,
  icon: resolveNavIcon(item.icon),
}));

const YCLOUD_LOGO_SRC = "/images/logo/ycloud-expand-logo.svg";

function SidebarLogo({ expanded }: { expanded: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-3 shrink-0 border-b border-gray-200/20 dark:border-gray-700 bg-gradient-to-r from-[#128C7E] to-[#25D366] dark:from-[#0d2d2a] dark:to-[#0f3d30]">
      {expanded ? (
        <>
          <Image src="/images/logo/logo-dark.svg" alt={APP_CONFIG.logoAlt} width={160} height={36} priority />
          <div className="mt-2.5 w-full flex items-center justify-end gap-1.5">
            <span className="text-[9px] font-normal leading-none tracking-wide text-white/65 whitespace-nowrap">
              Powered by
            </span>
            <Image
              src={YCLOUD_LOGO_SRC}
              alt="YCloud"
              width={52}
              height={14}
              className="brightness-0 invert opacity-85 shrink-0"
            />
          </div>
        </>
      ) : (
        <Image src="/images/logo/logo-icon.svg" alt={APP_CONFIG.logoAlt} width={36} height={36} priority />
      )}
    </div>
  );
}

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, toggleSidebar, toggleMobileSidebar, closeMobileSidebar } = useSidebar();
  const pathname = usePathname();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const isActive = (path?: string) => pathname === path;
  const show = isExpanded;

  // Close the mobile drawer whenever the route changes (e.g. after tapping a link)
  useEffect(() => {
    closeMobileSidebar();
  }, [pathname, closeMobileSidebar]);

  // Prevent the page behind the mobile drawer from scrolling while it is open
  useEffect(() => {
    if (!isMobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isMobileOpen]);

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
                    <ChevronDownIcon
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedItem === item.name ? "rotate-180" : ""}`}
                    />
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
          <SidebarCollapseIcon
            className={`text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 transition-transform duration-300 ${isExpanded ? "" : "rotate-180"}`}
          />
        </button>

        <SidebarLogo expanded={show} />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          <div>
            {show && <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2 mb-2">{NAV_SECTION_LABELS.main}</p>}
            {renderMenuItems(navItems)}
          </div>
          <div>
            {show && <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2 mb-2">{NAV_SECTION_LABELS.management}</p>}
            {renderMenuItems(managementItems)}
          </div>
        </nav>

        {/* Footer Links pinned at bottom */}
        <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
          {/* <Link
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
          </Link> */}
          <div className={`mt-3 space-y-1 px-2 ${show ? "" : "flex flex-col items-center"}`}>
            {show ? (
              <>
                <TermsOfServiceLink className="block text-xs text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400" />
                <PrivacyPolicyLink className="block text-xs text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400" />
                <DataDeletionLink
                  label={FOOTER_LINK_LABELS.dataDeletion}
                  className="block text-xs text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
                />
              </>
            ) : (
              <>
                <Link
                  href={PAGE_ROUTES.TERMS}
                  title={FOOTER_LINK_LABELS.terms}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-emerald-400"
                >
                  <TermsIcon />
                </Link>
                <Link
                  href={PAGE_ROUTES.PRIVACY}
                  title={FOOTER_LINK_LABELS.privacy}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-emerald-400"
                >
                  <PolicyIcon />
                </Link>
                <Link
                  href={PAGE_ROUTES.DATA_DELETION}
                  title={FOOTER_LINK_LABELS.dataDeletionTitle}
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
        <SidebarLogo expanded />
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">{NAV_SECTION_LABELS.main}</p>
            {renderMenuItems(navItems)}
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">{NAV_SECTION_LABELS.management}</p>
            {renderMenuItems(managementItems)}
          </div>
        </nav>
        <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <div className="space-y-1 px-2">
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
