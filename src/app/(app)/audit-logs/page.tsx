"use client";

import React from "react";
import { AuditLogFeed } from "@/components/audit/AuditLogFeed";
import { EMPTY_STATE_COPY, PAGE_METADATA } from "@/lib/constants";

export default function AuditLogsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {PAGE_METADATA.auditLogs.heading}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {EMPTY_STATE_COPY.auditLogs.pageDescription}
        </p>
      </div>

      <AuditLogFeed />
    </div>
  );
}
