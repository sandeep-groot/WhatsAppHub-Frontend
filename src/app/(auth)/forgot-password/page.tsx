import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { createPageMetadata } from "@/lib/constants";

export const metadata = createPageMetadata("forgotPassword");

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
