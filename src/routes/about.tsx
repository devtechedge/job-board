import { Link, createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site-footer";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    pageHead({
      title: "About — Jobrow",
      description:
        "Jobrow is a public register of still-open US tech roles from employer ATS boards.",
      path: "/about",
    }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <AppShell current="/about">
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="font-serif text-4xl font-semibold">About</h1>
        <div className="mt-6 space-y-4 text-base">
          <p>
            Jobrow lists public Greenhouse, Ashby, and Lever JSON. We are not the employer. Apply
            leaves this site. A role drops when a successful crawl no longer sees it. Those land on{' '}
            <Link to="/closed" className="text-pine underline underline-offset-4">
              Closed
            </Link>
            .
          </p>
          <p>
            Search is free. Checkout is not live. Saved jobs stay in the browser.
          </p>
          <p className="text-sm">
            <Link to="/legal/sourcing" className="text-pine underline underline-offset-4">
              Sourcing
            </Link>
            {" · "}
            <Link to="/legal/terms" className="text-pine underline underline-offset-4">
              Terms
            </Link>
            {" · "}
            <Link to="/legal/privacy" className="text-pine underline underline-offset-4">
              Privacy
            </Link>
            {" · "}
            <Link to="/contact" className="text-pine underline underline-offset-4">
              Contact
            </Link>
          </p>
        </div>
      </main>
    </AppShell>
  );
}
