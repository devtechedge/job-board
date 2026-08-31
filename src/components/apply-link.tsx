import { ExternalLink } from "lucide-react";
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
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-pine px-4 text-sm font-medium text-pine-fg hover:opacity-90",
        className,
      )}
    >
      Apply on {company} board
      <ExternalLink className="size-3.5" aria-hidden />
    </a>
  );
}
