import { PAGE_ROUTES } from "@/lib/constants";
import Link from "next/link";

const linkClass =
  "font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300";

interface TermsOfServiceLinkProps {
  className?: string;
  label?: string;
}

export default function TermsOfServiceLink({
  className = linkClass,
  label = "Terms of Service",
}: TermsOfServiceLinkProps) {
  return (
    <Link href={PAGE_ROUTES.TERMS} className={className}>
      {label}
    </Link>
  );
}
