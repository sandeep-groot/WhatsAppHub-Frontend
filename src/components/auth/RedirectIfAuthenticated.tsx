"use client";

import { useAuth } from "@/context/AuthContext";
import { PAGE_ROUTES } from "@/lib/constants";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function RedirectIfAuthenticated({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    const destination =
      redirect && redirect.startsWith("/") ? redirect : PAGE_ROUTES.DASHBOARD;
    router.replace(destination);
  }, [isAuthenticated, isLoading, redirect, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
