import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { PageMotion } from "@/components/page-motion";
import { SiteHeader } from "@/components/site-header";

export function SiteFooter() {
  return (
    <footer className="page-enter-footer border-t border-rule bg-inset">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="max-w-md">
          <p>Independent job board. Not an employer.</p>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          <Link to="/legal/sourcing" className="hover:text-ink">
            How we source
          </Link>
          <Link to="/employers" className="hover:text-ink">
            Add a board
          </Link>
          <Link to="/pricing" className="hover:text-ink">
            Pricing
          </Link>
          <Link to="/placements" className="hover:text-ink">
            Promote
          </Link>
          <Link to="/contact" className="hover:text-ink">
            Contact
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
    <PageMotion>
      <div className="flex min-h-screen flex-col bg-transparent text-ink">
        <SiteHeader current={current} />
        <div className="page-enter-main flex-1">{children}</div>
        <SiteFooter />
      </div>
    </PageMotion>
  );
}
