import RedirectIfAuthenticated from "@/components/auth/RedirectIfAuthenticated";
import SignInForm from "@/components/auth/SignInForm";
import { Suspense } from "react";

export const metadata = {
  title: "Sign In | WhatsAppHub",
  description: "Sign in to your WhatsAppHub account",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <RedirectIfAuthenticated>
        <SignInForm />
      </RedirectIfAuthenticated>
    </Suspense>
  );
}
