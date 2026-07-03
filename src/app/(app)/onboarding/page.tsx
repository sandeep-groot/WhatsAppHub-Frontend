import OnboardingClient from "@/components/onboarding/OnboardingClient";
import { createPageMetadata } from "@/lib/constants";

export const metadata = createPageMetadata("onboarding");

export default function OnboardingPage() {
  return <OnboardingClient />;
}
