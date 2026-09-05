import { cn } from "@/lib/utils";

export function HashMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("text-pine", className)}
      aria-hidden="true"
      fill="none"
    >
      <path d="M3 7.5h18M3 12h18M3 16.5h18" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 4.5v15" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-ink", className)}>
      <HashMark className="size-7" />
      <span className="font-serif text-3xl font-semibold tracking-tight">Jobrow</span>
    </span>
  );
}
