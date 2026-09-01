import { Link, createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site-footer";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — Jobrow" }] }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <AppShell current="/about">
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="font-serif text-4xl font-semibold">What Jobrow is</h1>
        <div className="mt-6 space-y-4 text-base text-ink">
          <p>
            Jobrow is a searchable index of public employer job boards. We read the same JSON those
            boards already expose on Greenhouse, Ashby, and Lever career sites, keep a row while the
            posting is present, and mark it closed when a successful crawl no longer sees it.
          </p>
          <p>
            We are not an employer, recruiter, or staffing agency. Listings belong to the companies
            that published them. Apply on the employer board — the button leaves Jobrow.
          </p>
          <p>
            First seen and last seen are timestamps from our crawl, not invented post dates. Pay is
            labeled posted when the board published a range, inferred when we parsed it from text.
            Summaries are our own one-liners from the posting, never copied from another product.
          </p>
          <p>
            Search is free. A Bound pass and ruled pins are on the rate card; checkout is not live
            and counsel has not cleared billing. A watchlist lives in your browser. Working brand
            name may change.
          </p>
          <p>
            <Link to="/contact" className="text-pine underline underline-offset-4">
              Write the desk
            </Link>
            {" · "}
            <Link to="/employers" className="text-pine underline underline-offset-4">
              Request a crawl slot
            </Link>
            {" · "}
            <Link to="/pricing" className="text-pine underline underline-offset-4">
              Rate card
            </Link>
            {" · "}
            <Link to="/placements" className="text-pine underline underline-offset-4">
              Placements
            </Link>
            {" · "}
            <Link to="/legal/sourcing" className="text-pine underline underline-offset-4">
              How we source jobs
            </Link>
            {", "}
            <Link to="/legal/terms" className="text-pine underline underline-offset-4">
              terms
            </Link>
            {", and "}
            <Link to="/legal/privacy" className="text-pine underline underline-offset-4">
              privacy
            </Link>
            .
          </p>
        </div>
      </main>
    </AppShell>
  );
}
