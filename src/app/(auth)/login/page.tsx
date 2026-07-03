import RedirectIfAuthenticated from "@/components/auth/RedirectIfAuthenticated";
import SignInForm from "@/components/auth/SignInForm";
import { createPageMetadata } from "@/lib/constants";
import { Suspense } from "react";

export const metadata = createPageMetadata("signIn");

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <RedirectIfAuthenticated>
        <SignInForm />
      </RedirectIfAuthenticated>
    </Suspense>
  );
}
