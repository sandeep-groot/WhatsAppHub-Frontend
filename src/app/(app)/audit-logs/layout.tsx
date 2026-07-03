import { createPageMetadata } from "@/lib/constants";

export const metadata = createPageMetadata("auditLogs");

export default function AuditLogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
