import { ExternalLink } from "lucide-react";
import { onPressDrop } from "@/lib/motion";
import { publicHttpsUrl } from "@/lib/safe";
import { cn } from "@/lib/utils";

export function ApplyLink({
  href,
  company,
  className,
}: {
  href: string;
  company: string;
  className?: string;
}) {
  const safe = publicHttpsUrl(href, 2000);
  if (!safe) return null;
  return (
    <a
      href={safe}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Apply at ${company}`}
      className={cn(
        "pressable inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-pine px-4 text-sm font-medium text-pine-fg hover:opacity-90",
        className,
      )}
      onPointerDown={(event) => onPressDrop(event)}
    >
      Apply
      <ExternalLink className="size-3.5" aria-hidden />
    </a>
  );
}
