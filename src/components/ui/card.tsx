// UI primitives - card component example
export function Card({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-lg border bg-white shadow ${className || ""}`} {...props}>
      {children}
    </div>
  );
}
