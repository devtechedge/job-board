import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site-footer";

export const Route = createFileRoute("/legal/sourcing")({
  head: () => ({ meta: [{ title: "How we source jobs — Jobrow" }] }),
  component: SourcingPage,
});

function SourcingPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="font-serif text-4xl font-semibold">How we source jobs</h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed">
          <p>
            Jobrow reads official public ATS board APIs — the same JSON an employer’s careers page
            already uses. We do not scrape Indeed, LinkedIn, ZipRecruiter, or other aggregators. We
            do not scrape hotfix.jobs or republish another product’s summaries.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Greenhouse: <code className="font-mono text-xs">boards-api.greenhouse.io/v1/boards/{"{token}"}/jobs</code>
            </li>
            <li>
              Ashby:{" "}
              <code className="font-mono text-xs">
                api.ashbyhq.com/posting-api/job-board/{"{org}"}?includeCompensation=true
              </code>
            </li>
            <li>
              Lever: <code className="font-mono text-xs">api.lever.co/v0/postings/{"{site}"}?mode=json</code>
            </li>
          </ul>
          <p>
            Refresh: twice a day (scheduled crawl). A role is marked closed when it is missing from a
            successful board fetch. A failed fetch (timeout, 429, 5xx, unreadable body) does not close
            that company’s open set — we keep the last good snapshot and log the error.
          </p>
          <p>
            Apply always goes to the employer ATS URL. We keep US-eligible tech roles in the public
            register. First seen / last seen are our crawl clocks.
          </p>
          <p>Independent index. Not affiliated with Greenhouse, Ashby, Lever, or any employer.</p>
        </div>
      </main>
    </AppShell>
  );
}
