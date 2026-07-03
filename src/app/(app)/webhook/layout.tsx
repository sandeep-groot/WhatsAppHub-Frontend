import { createPageMetadata } from "@/lib/constants";

export const metadata = createPageMetadata("webhooks");

export default function WebhooksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
