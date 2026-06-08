"use client";

import AuthFormShell from "@/components/auth/AuthFormShell";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { useAuth } from "@/context/AuthContext";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { SESSION_EXPIRED_MESSAGE } from "@/lib/auth/session-events";
import { PAGE_ROUTES } from "@/lib/constants";
import { ApiError } from "@/lib/http";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const linkClass =
  "font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300";

export default function SignInForm() {
  const { login, sessionExpiredMessage, clearSessionExpiredMessage } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const sessionExpired = searchParams.get("sessionExpired");

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (sessionExpired === "1") {
      setError(sessionExpiredMessage ?? SESSION_EXPIRED_MESSAGE);
      clearSessionExpiredMessage();
    }
  }, [sessionExpired, sessionExpiredMessage, clearSessionExpiredMessage]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      const destination =
        redirect && redirect.startsWith("/") ? redirect : PAGE_ROUTES.DASHBOARD;
      router.replace(destination);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to sign in. Please check your credentials and try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthFormShell
      title="Sign In"
      description="Enter your email and password to sign in!"
      footer={
        null
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          {error && (
            <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 dark:border-error-500/30 dark:bg-error-500/10">
              <p className="text-sm text-error-600 dark:text-error-400" role="alert">
                {error}
              </p>
            </div>
          )}
          <div>
            <Label>
              Email <span className="text-error-500">*</span>
            </Label>
            <Input
              type="email"
              name="email"
              placeholder="info@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={Boolean(error)}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label>
              Password <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={Boolean(error)}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeIcon className="h-5 w-5 fill-current" />
                ) : (
                  <EyeCloseIcon className="h-5 w-5 fill-current" />
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox checked={isChecked} onChange={setIsChecked} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Keep me logged in
              </span>
            </div>
            <Link href={PAGE_ROUTES.FORGOT_PASSWORD} className={`text-sm ${linkClass}`}>
              Forgot password?
            </Link>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </div>
      </form>
    </AuthFormShell>
  );
}
