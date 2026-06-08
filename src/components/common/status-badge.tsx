// Common component - Status Badge
interface StatusBadgeProps {
  status: "active" | "inactive" | "pending" | "error";
  label: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const styles = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
  };

  return (
    <span className={`px-2 py-1 rounded text-sm font-medium ${styles[status]}`}>
      {label}
    </span>
  );
}
