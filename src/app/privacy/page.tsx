import { env } from "@/lib/env";
import { PAGE_ROUTES } from "@/lib/constants";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Privacy Policy | ${env.NEXT_PUBLIC_APP_NAME}`,
  description: `Privacy Policy for ${env.NEXT_PUBLIC_APP_NAME}`,
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href={PAGE_ROUTES.LOGIN} className="flex items-center gap-2">
            <Image
              src="/images/logo/logo-icon.svg"
              alt={env.NEXT_PUBLIC_APP_NAME}
              width={32}
              height={32}
            />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {env.NEXT_PUBLIC_APP_NAME}
            </span>
          </Link>
          <Link
            href={PAGE_ROUTES.LOGIN}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="mt-8 space-y-6 text-gray-700 dark:text-gray-300">
          <p>
            We collect and process WhatsApp Business onboarding data solely for
            providing messaging and onboarding services through{" "}
            {env.NEXT_PUBLIC_APP_NAME}.
          </p>

          <p>
            We do not sell personal information to third parties.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Contact
            </h2>
            <p className="mt-2">
              If you have questions about this policy, contact us at{" "}
              <a
                href="mailto:info@grootsoftwares.com"
                className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                info@grootsoftwares.com
              </a>
              .
            </p>
          </section>
        </div>

        <p className="mt-10 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
          <Link
            href={PAGE_ROUTES.DATA_DELETION}
            className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          >
            Data Deletion Instructions
          </Link>
          <Link
            href={PAGE_ROUTES.TERMS}
            className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          >
            Terms of Service
          </Link>
          <Link
            href={PAGE_ROUTES.LOGIN}
            className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          >
            ← Back to sign in
          </Link>
        </p>
      </main>
    </div>
  );
}
