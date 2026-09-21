import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
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
  const [menuOpen, setMenuOpen] = useState(false);

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

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const linkClass = (to: string) =>
    current === to
      ? "font-medium text-pine underline decoration-from-font underline-offset-4"
      : "text-ink hover:text-pine";

  return (
    <header className="page-enter-header border-b border-rule bg-paper/80 backdrop-blur-sm" data-parallax="slow">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Jobrow home">
          <Wordmark />
          <span className="hidden h-6 w-px shrink-0 bg-rule-strong sm:block" aria-hidden="true" />
          <span className="hidden truncate font-serif text-lg italic text-muted sm:inline">
            Still open.
          </span>
        </Link>

        {/* Desktop / tablet nav */}
        <nav className="hidden min-w-0 items-center justify-end gap-x-4 gap-y-1 text-sm md:flex">
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} className={linkClass(item.to)}>
              {item.label}
            </Link>
          ))}
          <span className="text-muted">Saved {watched}</span>
          <Link to="/closed" className={linkClass("/closed")}>
            Closed
          </Link>
          <ThemeToggle />
        </nav>

        {/* Phone: keep Saved/Closed usable; collapse primary nav */}
        <div className="flex min-w-0 items-center gap-3 text-sm md:hidden">
          <span className="shrink-0 text-muted">Saved {watched}</span>
          <Link to="/closed" className={`shrink-0 ${linkClass("/closed")}`}>
            Closed
          </Link>
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-rule text-ink"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="jobrow-mobile-nav"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="jobrow-mobile-nav"
          className="border-t border-rule px-4 py-2 md:hidden sm:px-6"
        >
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 text-sm">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`block rounded-md px-2 py-2.5 ${linkClass(item.to)}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
