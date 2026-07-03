import SignUpForm from "@/components/auth/SignUpForm";
import { createPageMetadata } from "@/lib/constants";

export const metadata = createPageMetadata("signUp");

export default function SignUpPage() {
  return <SignUpForm />;
}
