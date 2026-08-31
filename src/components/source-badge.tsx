import { atsLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export function SourceBadge({ ats }: { ats: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border border-rule bg-chip px-1.5 py-0.5",
        "font-mono text-[11px] uppercase tracking-wide text-muted",
      )}
    >
      {atsLabel(ats)}
    </span>
  );
}
