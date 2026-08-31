import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/mark";
import { listWatched } from "@/lib/watchlist";

const NAV = [
  { to: "/", label: "Register" },
  { to: "/jobs", label: "Index" },
  { to: "/companies", label: "Companies" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader({ current }: { current?: string }) {
  const [watched, setWatched] = useState(0);
  useEffect(() => {
    const sync = () => setWatched(listWatched().length);
    sync();
    window.addEventListener("jobrow:watchlist", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("jobrow:watchlist", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <header className="border-b border-rule bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="shrink-0" aria-label="Jobrow home">
          <Wordmark />
        </Link>
        <p className="hidden font-serif text-sm italic text-muted sm:block">Still open.</p>
        <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={
                current === item.to
                  ? "font-medium text-pine underline decoration-from-font underline-offset-4"
                  : "text-ink hover:text-pine"
              }
            >
              {item.label}
            </Link>
          ))}
          <span className="text-muted">
            Watched {watched}
          </span>
        </nav>
      </div>
    </header>
  );
}
