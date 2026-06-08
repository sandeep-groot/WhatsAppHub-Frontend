"use client";

import AuthFormShell from "@/components/auth/AuthFormShell";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { PAGE_ROUTES } from "@/lib/constants";
import Link from "next/link";
import { useState } from "react";

const linkClass =
  "font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: Implement forgot password API
    await new Promise((res) => setTimeout(res, 800));
    setSubmitted(true);
    setIsSubmitting(false);
  }

  if (submitted) {
    return (
      <AuthFormShell
        title="Check your email"
        description="We've sent password reset instructions if an account exists for this address."
        backHref={PAGE_ROUTES.LOGIN}
        backLabel="Back to sign in"
      >
        <div className="rounded-lg border border-success-200 bg-success-50 px-5 py-4 dark:border-success-500/30 dark:bg-success-500/10">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            If an account exists for{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {email}
            </span>
            , a reset link has been sent.
          </p>
          <Link href={PAGE_ROUTES.LOGIN} className={`mt-4 inline-block text-sm ${linkClass}`}>
            Back to sign in
          </Link>
        </div>
      </AuthFormShell>
    );
  }

  return (
    <AuthFormShell
      title="Forgot Your Password?"
      description="Enter the email address linked to your account, and we'll send you a link to reset your password."
      footer={
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 sm:text-start">
          Back to sign in?{" "}
          <Link href={PAGE_ROUTES.LOGIN} className={linkClass}>
            Click here
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div>
            <Label>
              Email <span className="text-error-500">*</span>
            </Label>
            <Input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <Button type="submit" disabled={isSubmitting || !email.trim()}>
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </Button>
        </div>
      </form>
    </AuthFormShell>
  );
}
