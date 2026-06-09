import { PAGE_ROUTES } from "@/lib/constants";
import Link from "next/link";

const linkClass =
  "font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300";

interface PrivacyPolicyLinkProps {
  className?: string;
}

export default function PrivacyPolicyLink({ className = linkClass }: PrivacyPolicyLinkProps) {
  return (
    <Link href={PAGE_ROUTES.PRIVACY} className={className}>
      Privacy Policy
    </Link>
  );
}
