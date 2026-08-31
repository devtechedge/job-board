import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";

export function SiteFooter() {
  return (
    <footer className="border-t border-rule bg-inset">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="max-w-md space-y-1">
          <p>Indexed from public Greenhouse, Ashby, and Lever boards. Not an employer.</p>
          <p>Independent index. Not affiliated with any ATS vendor.</p>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          <Link to="/legal/sourcing" className="hover:text-ink">
            How we source
          </Link>
          <Link to="/legal/terms" className="hover:text-ink">
            Terms
          </Link>
          <Link to="/legal/privacy" className="hover:text-ink">
            Privacy
          </Link>
          <Link to="/about" className="hover:text-ink">
            About
          </Link>
          <Link to="/admin" className="hover:text-ink">
            Admin
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export function AppShell({
  children,
  current,
}: {
  children: ReactNode;
  current?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <SiteHeader current={current} />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
