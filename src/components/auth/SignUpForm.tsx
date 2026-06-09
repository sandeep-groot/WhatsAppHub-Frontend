"use client";

import AuthFormShell from "@/components/auth/AuthFormShell";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import PrivacyPolicyLink from "@/components/common/PrivacyPolicyLink";
import TermsOfServiceLink from "@/components/common/TermsOfServiceLink";
import { PAGE_ROUTES } from "@/lib/constants";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const linkClass =
  "font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300";

export default function SignUpForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isChecked) {
      setError("Please agree to the Terms and Conditions and Privacy Policy.");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement signup API
      console.log("Sign up with:", { firstName, lastName, email, password });
      router.push(PAGE_ROUTES.LOGIN);
    } catch {
      setError("Unable to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthFormShell
      title="Sign Up"
      description="Enter your email and password to sign up!"
      footer={
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 sm:text-start">
          Already have an account?{" "}
          <Link href={PAGE_ROUTES.LOGIN} className={linkClass}>
            Sign In
          </Link>
        </p>
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
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Label>
                First Name<span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                name="firstName"
                placeholder="Enter your first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label>
                Last Name<span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                name="lastName"
                placeholder="Enter your last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div>
            <Label>
              Email<span className="text-error-500">*</span>
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
          <div>
            <Label>
              Password<span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          <div className="flex items-start gap-3">
            <Checkbox checked={isChecked} onChange={setIsChecked} />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              By creating an account means you agree to the{" "}
              <TermsOfServiceLink label="Terms and Conditions" />
              , and our <PrivacyPolicyLink />
            </p>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </Button>
        </div>
      </form>
    </AuthFormShell>
  );
}
