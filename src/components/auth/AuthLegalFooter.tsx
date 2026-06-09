import DataDeletionLink from "@/components/common/DataDeletionLink";
import PrivacyPolicyLink from "@/components/common/PrivacyPolicyLink";
import TermsOfServiceLink from "@/components/common/TermsOfServiceLink";

const linkClass =
  "text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300";

export default function AuthLegalFooter() {
  return (
    <p className="text-center text-xs leading-relaxed text-gray-500 dark:text-gray-400 sm:text-start">
      <TermsOfServiceLink className={linkClass} />
      <span className="mx-2">·</span>
      <PrivacyPolicyLink className={linkClass} />
      <span className="mx-2">·</span>
      <DataDeletionLink className={linkClass} label="Data Deletion" />
    </p>
  );
}
