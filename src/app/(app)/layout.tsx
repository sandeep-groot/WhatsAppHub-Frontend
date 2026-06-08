import AppLayoutClient from "./AppLayoutClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | WhatsAppHub",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutClient>{children}</AppLayoutClient>;
}
