import { createPageMetadata } from "@/lib/constants";

export const metadata = createPageMetadata("clients");

export default function ClientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
