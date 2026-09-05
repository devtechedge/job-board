import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { listWatched } from "@/lib/watchlist";

const NAV = [
  { to: "/", label: "Jobs" },
  { to: "/jobs", label: "Search" },
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
    <header className="page-enter-header border-b border-rule bg-paper/80 backdrop-blur-sm" data-parallax="slow">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Jobrow home">
          <Wordmark />
          <span className="hidden h-6 w-px shrink-0 bg-rule-strong sm:block" aria-hidden="true" />
          <span className="hidden truncate font-serif text-lg italic text-muted sm:inline">
            Still open.
          </span>
        </Link>
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
          <span className="text-muted">Saved {watched}</span>
          <Link
            to="/closed"
            className={
              current === "/closed"
                ? "font-medium text-pine underline decoration-from-font underline-offset-4"
                : "text-ink hover:text-pine"
            }
          >
            Closed
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
