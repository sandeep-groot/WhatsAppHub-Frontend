import { env } from "@/lib/env";
import { PAGE_ROUTES } from "@/lib/constants";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const SUPPORT_EMAIL = "info@grootsoftwares.com";

export const metadata: Metadata = {
  title: `Data Deletion Instructions | ${env.NEXT_PUBLIC_APP_NAME}`,
  description: `How to request deletion of your data from ${env.NEXT_PUBLIC_APP_NAME}`,
};

export default function DataDeletionPage() {
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
          Data Deletion Instructions
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <div className="mt-8 space-y-6 text-gray-700 dark:text-gray-300">
          <p>
            If you want your personal data removed from {env.NEXT_PUBLIC_APP_NAME},
            you can request deletion using the steps below.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              How to request deletion
            </h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>
                Email{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=Data%20Deletion%20Request`}
                  className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  {SUPPORT_EMAIL}
                </a>{" "}
                with the subject line &quot;Data Deletion Request&quot;.
              </li>
              <li>
                Include the email address associated with your{" "}
                {env.NEXT_PUBLIC_APP_NAME} or WhatsApp Business account.
              </li>
              <li>
                We will verify your request and confirm once deletion is complete.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              What we delete
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Account profile information (name, email, roles)</li>
              <li>WhatsApp Business onboarding and connection data</li>
              <li>Associated messaging configuration stored in our platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Processing time
            </h2>
            <p className="mt-2">
              Deletion requests are typically processed within 30 days. Some data
              may be retained only where required by law or for legitimate
              security and audit purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Contact
            </h2>
            <p className="mt-2">
              For questions about data deletion, contact{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </section>
        </div>

        <p className="mt-10 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
          <Link
            href={PAGE_ROUTES.PRIVACY}
            className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          >
            Privacy Policy
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
