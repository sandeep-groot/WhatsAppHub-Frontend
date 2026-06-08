// UI primitives - input component example
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  className,
  ...props
}: InputProps) {
  return (
    <div>
      {label && <label>{label}</label>}
      <input {...props} className={className} />
      {error && <span className="text-red-500">{error}</span>}
    </div>
  );
}
