"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { LogoutConfirmModal } from "@/components/auth/LogoutConfirmModal";
import {
  ChevronDownIcon,
  LogOutIcon as LogOut,
  SidebarCollapseIcon,
} from "@/icons";
import { APP_CONFIG, NAV_SECTION_LABELS } from "@/lib/constants";
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
    <div className="h-[84px] flex flex-col items-center justify-center px-4 py-3 shrink-0 border-b border-gray-200/20 dark:border-gray-700 bg-gradient-to-r from-[#128C7E] to-[#25D366] dark:from-[#0d2d2a] dark:to-[#0f3d30] overflow-hidden transition-all duration-300 ease-in-out">
      {expanded ? (
        <div className="w-full flex flex-col items-center animate-fade-in transition-all duration-300 ease-in-out">
          <Image src="/images/logo/logo-dark.svg" alt={APP_CONFIG.logoAlt} width={300} height={56} priority />
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
        </div>
      ) : (
        <div className="w-full flex items-center justify-center animate-fade-in transition-all duration-300 ease-in-out">
          <Image src="/images/logo/logo-icon.svg" alt={APP_CONFIG.logoAlt} width={36} height={36} priority />
        </div>
      )}
    </div>
  );
}

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, toggleSidebar, toggleMobileSidebar, closeMobileSidebar } = useSidebar();
  const { logout } = useAuth();
  const pathname = usePathname();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const isActive = (path?: string) => pathname === path;
  const show = isExpanded;

  // Close the mobile drawer whenever the route changes
  useEffect(() => {
    closeMobileSidebar();
  }, [pathname, closeMobileSidebar]);

  // Prevent background scrolling while mobile drawer is open
  useEffect(() => {
    if (!isMobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isMobileOpen]);

  // Icon box wrapper — gray bg normally, emerald gradient when active
  const iconBox = (active: boolean) =>
    `flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-all duration-300 ease-in-out ${
      active
        ? "bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25"
        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-emerald-100/70 group-hover:text-emerald-600 dark:group-hover:bg-gray-700 dark:group-hover:text-emerald-400"
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
                  type="button"
                  onClick={() => setExpandedItem(expandedItem === item.name ? null : item.name)}
                  className="group w-full flex items-center gap-3 px-2 py-1.5 rounded-xl text-sm font-medium transition-all duration-300 ease-in-out text-gray-700 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                >
                  <span className={iconBox(false)}>{item.icon}</span>
                  {show && (
                    <span className="flex-1 text-left whitespace-nowrap transition-all duration-300 ease-in-out">
                      {item.name}
                    </span>
                  )}
                  {show && (
                    <ChevronDownIcon
                      className={`w-4 h-4 text-gray-400 transition-all duration-300 ease-in-out ${
                        expandedItem === item.name ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>
                {expandedItem === item.name && show && (
                  <ul className="mt-1 ml-12 space-y-1 transition-all duration-300 ease-in-out">
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
                className={`group flex items-center gap-3 px-2 py-1.5 rounded-xl text-sm font-medium transition-all duration-300 ease-in-out ${
                  active
                    ? "bg-emerald-50 dark:bg-gray-700 shadow-sm text-emerald-700 dark:text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                } ${!show ? "justify-center" : ""}`}
              >
                <span className={iconBox(active)}>{item.icon}</span>
                {show && (
                  <span className="whitespace-nowrap transition-all duration-300 ease-in-out">
                    {item.name}
                  </span>
                )}
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
        className={`relative flex-shrink-0 hidden lg:flex flex-col h-screen bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-[width] duration-300 ease-in-out ${
          isExpanded ? "w-64" : "w-[72px]"
        }`}
      >
        {/* Collapse toggle */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="group hidden lg:flex absolute -right-3.5 top-20 z-50 w-7 h-7 items-center justify-center rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md dark:hover:bg-gray-600 transition-all duration-300 ease-in-out hover:scale-110 active:scale-95"
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <SidebarCollapseIcon
            className={`text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 transition-transform duration-300 ease-in-out ${
              isExpanded ? "rotate-0" : "rotate-180"
            }`}
          />
        </button>

        <SidebarLogo expanded={show} />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          <div>
            {show && (
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2 mb-2 whitespace-nowrap transition-all duration-300 ease-in-out">
                {NAV_SECTION_LABELS.main}
              </p>
            )}
            {renderMenuItems(navItems)}
          </div>
          <div>
            {show && (
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2 mb-2 whitespace-nowrap transition-all duration-300 ease-in-out">
                {NAV_SECTION_LABELS.management}
              </p>
            )}
            {renderMenuItems(managementItems)}
          </div>
        </nav>

        {/* Footer Logout Button pinned at bottom */}
        <div className="px-3 py-3 border-t border-gray-200 dark:border-gray-700 shrink-0">
          {show ? (
            <button
              type="button"
              onClick={() => setIsLogoutConfirmOpen(true)}
              className="group w-full flex items-center gap-3 px-2 py-1.5 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all duration-300 ease-in-out"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 bg-rose-50 dark:bg-rose-950/40 text-rose-500 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/60 transition-all duration-300">
                <LogOut className="w-4 h-4 text-rose-500" />
              </span>
              <span className="whitespace-nowrap transition-all duration-300 ease-in-out font-semibold">
                Logout
              </span>
            </button>
          ) : (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(true)}
                title="Logout"
                className="group flex items-center justify-center w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all duration-300"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 flex flex-col lg:hidden transition-transform duration-300 ease-in-out ${
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

        {/* Mobile Footer Logout Button */}
        <div className="px-3 py-3 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <button
            type="button"
            onClick={() => {
              closeMobileSidebar();
              setIsLogoutConfirmOpen(true);
            }}
            className="group w-full flex items-center gap-3 px-2 py-1.5 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all duration-300"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 bg-rose-50 dark:bg-rose-950/40 text-rose-500 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/60 transition-all duration-300">
              <LogOut className="w-4 h-4 text-rose-500" />
            </span>
            <span className="whitespace-nowrap font-semibold">
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={logout}
      />
    </>
  );
};

export default AppSidebar;
