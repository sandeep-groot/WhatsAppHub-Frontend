import { createPageMetadata } from "@/lib/constants";

export const metadata = createPageMetadata("messages");

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
