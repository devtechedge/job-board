import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site-footer";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({ meta: [{ title: "Terms — Jobrow" }] }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="font-serif text-4xl font-semibold">Terms of use</h1>
        <p className="mt-2 text-sm text-muted">Placeholder draft. Counsel has not reviewed this.</p>
        <div className="mt-6 space-y-4 text-sm leading-relaxed">
          <p>
            Operator: “Jobrow Project” until a legal entity exists. These terms govern use of the
            Jobrow website and index.
          </p>
          <p>
            Service: a searchable index of public employer job postings. Jobrow is not an employer,
            recruiter, or employment agency. We do not guarantee that a listing is current, complete,
            or a fit for you.
          </p>
          <p>
            Listings belong to the employers. We may show short original summaries. Confirm every
            detail — pay, location, eligibility, closing date — on the employer board before you
            apply. Apply links leave this site.
          </p>
          <p>
            v1 does not sell resumes and does not require an account to search. Do not upload
            personal employment documents here; there is no resume feature.
          </p>
          <p>
            Rate card: Bound pass (seeker courier + closed drawer) and placements (ruled pin,
            masthead line) are advertised as waitlist items. Checkout is not live. Filing a request
            is not a contract and does not start billing. Counsel must review any paid product
            before a card is charged. A pin, if ever run, ends when a successful crawl no longer
            lists the role. Refunds are TODO for counsel. Paid placement is advertising on an index,
            not an employment agency service.
          </p>
          <p>
            Acceptable use: no scraping this site, no bulk harvesting of our index, no circumventing
            rate limits, and no impersonating Jobrow or an employer. We may rate-limit or block
            abusive traffic.
          </p>
          <p>
            THE SERVICE IS PROVIDED “AS IS”. TO THE MAXIMUM EXTENT ALLOWED BY LAW, THE OPERATOR
            DISCLAIMS WARRANTIES OF MERCHANTABILITY, FITNESS, AND NON-INFRINGEMENT, AND IS NOT
            LIABLE FOR LOST OFFERS, INACCURATE LISTINGS, OR INDIRECT DAMAGES.
          </p>
          <p>
            Governing law: laws of the operator’s jurisdiction (TODO: replace with a chosen state,
            Illinois suggested only as a placeholder). Venue and mandatory arbitration are TODO for
            counsel.
          </p>
        </div>
      </main>
    </AppShell>
  );
}
