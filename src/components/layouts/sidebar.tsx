// Layout component - Sidebar
"use client";

import Link from "next/link";
import { PAGE_ROUTES } from "@/lib/constants";

export function AppSidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold">WhatsAppHub</h1>
      </div>
      <nav className="space-y-2 px-4">
        <Link
          href={PAGE_ROUTES.DASHBOARD}
          className="block px-4 py-2 rounded hover:bg-gray-800"
        >
          Dashboard
        </Link>
        <Link
          href={PAGE_ROUTES.CLIENTS}
          className="block px-4 py-2 rounded hover:bg-gray-800"
        >
          Clients
        </Link>
        <Link
          href={PAGE_ROUTES.USERS}
          className="block px-4 py-2 rounded hover:bg-gray-800"
        >
          Users
        </Link>
        <Link
          href={PAGE_ROUTES.ROLES}
          className="block px-4 py-2 rounded hover:bg-gray-800"
        >
          Roles
        </Link>
        <Link
          href={PAGE_ROUTES.WEBHOOKS}
          className="block px-4 py-2 rounded hover:bg-gray-800"
        >
          Webhooks
        </Link>
        <Link
          href={PAGE_ROUTES.AUDIT_LOGS}
          className="block px-4 py-2 rounded hover:bg-gray-800"
        >
          Audit Logs
        </Link>
        <Link
          href={PAGE_ROUTES.SETTINGS}
          className="block px-4 py-2 rounded hover:bg-gray-800"
        >
          Settings
        </Link>
      </nav>
    </aside>
  );
}
