"use client";

import React from "react";
import { AuditLogFeed } from "@/components/audit/AuditLogFeed";

export default function AuditLogsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Audit Logs
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track system activity across WhatsAppHub. Search the feed and scroll to
          load more entries automatically.
        </p>
      </div>

      <AuditLogFeed />
    </div>
  );
}
