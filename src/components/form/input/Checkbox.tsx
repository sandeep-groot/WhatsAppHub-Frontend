interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export default function Checkbox({
  checked,
  onChange,
  disabled = false,
  className = "",
}: CheckboxProps) {
  return (
    <label
      className={`relative inline-flex cursor-pointer items-center ${
        disabled ? "cursor-not-allowed opacity-60" : ""
      }`}
    >
      <input
        type="checkbox"
        className={`h-4 w-4 cursor-pointer rounded border-gray-300 text-emerald-600 focus:ring-emerald-500/20 dark:border-gray-600 dark:bg-gray-800 ${className}`}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
    </label>
  );
}
