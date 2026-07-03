import { createPageMetadata } from "@/lib/constants";

export const metadata = createPageMetadata("connections");

export default function ConnectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
