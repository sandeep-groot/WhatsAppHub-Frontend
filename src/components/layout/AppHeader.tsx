"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import { useTheme } from "@/context/ThemeContext";
import { ProfileModal } from "@/components/auth/ProfileModal";
import { PAGE_ROUTES } from "@/lib/constants";
import {
  ChevronDownIcon as ChevronDown,
  DeletionIcon as Deletion,
  MenuIcon as Menu,
  MoonIcon as Moon,
  PolicyIcon as Policy,
  SunIcon as Sun,
  TermsIcon as Terms,
  UserIcon,
} from "@/icons";

const AppHeader: React.FC = () => {
  const { user } = useAuth();
  const { toggleMobileSidebar } = useSidebar();
  const { isDark, toggleTheme } = useTheme();
  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const roleLabel = user?.roles ? user.roles.join(", ") : "";
  const avatarLetter = (displayName[0] ?? "U").toUpperCase();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 transition-colors">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">

        {/* Left — mobile hamburger */}
        <div className="flex items-center gap-3">
          {/* Mobile-only hamburger */}
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-gray-800 dark:text-gray-400 rounded-xl transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5 sm:gap-3">

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-gray-800 dark:text-gray-400 rounded-xl transition-colors"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="group flex items-center gap-2.5 p-1.5 hover:bg-emerald-50/80 dark:hover:bg-gray-800/80 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm shadow-emerald-500/20">
                {avatarLetter}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                  {displayName}
                </span>
                {roleLabel && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {roleLabel}
                  </span>
                )}
              </div>
              <ChevronDown className="hidden md:block w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-transform duration-200" />
            </button>
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/80 dark:border-gray-700/80 overflow-hidden animate-fade-in">
                <ul className="py-1">
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="group w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-gray-700/60 dark:hover:text-emerald-400 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                      <span>Profile</span>
                    </button>
                  </li>

                  {/* 
                  <li className="border-t border-gray-100 dark:border-gray-700/80 my-1" />

                  <li>
                    <Link
                      href={PAGE_ROUTES.TERMS}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="group w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-gray-700/60 dark:hover:text-emerald-400 transition-colors"
                    >
                      <Terms className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                      <span>Terms of Service</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={PAGE_ROUTES.PRIVACY}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="group w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-gray-700/60 dark:hover:text-emerald-400 transition-colors"
                    >
                      <Policy className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                      <span>Privacy Policy</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={PAGE_ROUTES.DATA_DELETION}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="group w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-gray-700/60 dark:hover:text-emerald-400 transition-colors"
                    >
                      <Deletion className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                      <span>Data Deletion</span>
                    </Link>
                  </li>
                  */}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Extracted Modals */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </header>
  );
};

export default AppHeader;
