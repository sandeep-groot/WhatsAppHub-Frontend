"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import { useTheme } from "@/context/ThemeContext";
import { ProfileModal } from "@/components/auth/ProfileModal";
import { LogoutConfirmModal } from "@/components/auth/LogoutConfirmModal";
import {
  BellIcon,
  ChevronDownIcon,
  MenuIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
} from "@/icons";

const AppHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { toggleMobileSidebar } = useSidebar();
  const { isDark, toggleTheme } = useTheme();
  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const roleLabel = user?.roles ? user.roles.join(", ") : "";
  const avatarLetter = (displayName[0] ?? "U").toUpperCase();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">

        {/* Left — mobile hamburger + search */}
        <div className="flex items-center gap-3">
          {/* Mobile-only hamburger */}
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>

          {/* Search */}
          <div className="hidden sm:flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
            <SearchIcon className="w-4 h-4 text-gray-500 shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm w-40 md:w-56 text-gray-700 dark:text-gray-200 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1 sm:gap-2">

          {/* Mobile search icon */}
          <button className="sm:hidden p-2 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <SearchIcon className="w-5 h-5 text-gray-500" />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <BellIcon />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-80 overflow-y-auto">
                  <div className="p-4 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">New message</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">You have a new message from Admin</p>
                    <p className="text-xs text-gray-400 mt-1.5">2 minutes ago</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <SunIcon className="w-5 h-5 text-yellow-400" />
            ) : (
              <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="group flex items-center gap-2 p-1.5 hover:bg-emerald-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-emerald-500 group-hover:bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 transition-colors ring-2 ring-transparent group-hover:ring-emerald-200 dark:group-hover:ring-emerald-800">
                {avatarLetter}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                {displayName}
              </span>
              {roleLabel && (
                <span className="hidden md:block text-xs text-emerald-600 dark:text-emerald-400">
                  ({roleLabel})
                </span>
              )}
              <ChevronDownIcon className="hidden md:block w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
            </button>
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <ul>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="w-full text-left block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-gray-700 dark:hover:text-emerald-400 transition-colors"
                    >
                      Profile
                    </button>
                  </li>
                  <li>
                    {/* <Link href="#" className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-gray-700 dark:hover:text-emerald-400 transition-colors">Settings</Link> */}
                  </li>
                  <li className="border-t border-gray-100 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsLogoutConfirmOpen(true);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Logout
                    </button>
                  </li>
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

      <LogoutConfirmModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={logout}
      />
    </header>
  );
};

export default AppHeader;
