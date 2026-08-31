import type { ReactNode } from "react";

export function DeskField({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1 border-t border-rule py-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-start sm:gap-6">
      <label htmlFor={htmlFor} className="pt-2 text-[11px] uppercase tracking-[0.14em] text-muted">
        {label}
      </label>
      <div>
        {children}
        {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      </div>
    </div>
  );
}
