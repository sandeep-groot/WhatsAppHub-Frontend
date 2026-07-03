import DashboardContent from "@/components/dashboard/DashboardContent";
import { createPageMetadata } from "@/lib/constants";

export const metadata = createPageMetadata("dashboard");

export default function DashboardPage() {
  return <DashboardContent />;
}
