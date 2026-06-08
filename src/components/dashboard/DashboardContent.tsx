"use client";

import { useAuth } from "@/context/AuthContext";

export default function DashboardContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = user.name || user.email;

  return (
    <div className="space-y-6">
      <div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>

        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Welcome back, {displayName}
        </p>
      </div>     
    </div>
  );
}
