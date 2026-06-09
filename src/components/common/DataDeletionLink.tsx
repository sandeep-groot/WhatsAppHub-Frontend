import { PAGE_ROUTES } from "@/lib/constants";
import Link from "next/link";

const linkClass =
  "font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300";

interface DataDeletionLinkProps {
  className?: string;
  label?: string;
}

export default function DataDeletionLink({
  className = linkClass,
  label = "Data Deletion",
}: DataDeletionLinkProps) {
  return (
    <Link href={PAGE_ROUTES.DATA_DELETION} className={className}>
      {label}
    </Link>
  );
}
