import { Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import { onPressDrop } from "@/lib/motion";
import { isWatched, toggleWatched, type Watched } from "@/lib/watchlist";
import { cn } from "@/lib/utils";

export function WatchButton({ item }: { item: Watched }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(isWatched(item.id));
  }, [item.id]);

  return (
    <button
      type="button"
      onClick={() => {
        const next = toggleWatched(item);
        setOn(next.some((row) => row.id === item.id));
      }}
      onPointerDown={(event) => onPressDrop(event)}
      className={cn(
        "pressable inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm border border-rule text-muted hover:bg-inset hover:text-ink",
        on && "border-pine text-pine",
      )}
      aria-pressed={on}
      aria-label={on ? "Remove from watchlist" : "Watch this role"}
    >
      <Bookmark className={cn("size-4", on && "fill-pine")} />
    </button>
  );
}
