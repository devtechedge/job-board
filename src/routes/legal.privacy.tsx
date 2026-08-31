import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/site-footer";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({ meta: [{ title: "Privacy — Jobrow" }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="font-serif text-4xl font-semibold">Privacy</h1>
        <p className="mt-2 text-sm text-muted">Placeholder draft. Counsel has not reviewed this.</p>
        <div className="mt-6 space-y-4 text-sm leading-relaxed">
          <p>
            v1 search does not require an account. Optional watchlist data stays in your browser
            (localStorage). We do not receive those titles unless you later create an account and
            choose to sync — and that feature does not exist yet.
          </p>
          <p>
            The server may keep ordinary request logs (IP, user agent, path, time) to operate and
            protect the service. We do not collect resumes. Do not send us one.
          </p>
          <p>
            Crawl data is public job text published by employers on their ATS boards. We store
            titles, locations, apply URLs, and posting HTML as needed to run the index.
          </p>
          <p>
            We do not sell personal data. We do not use third-party advertising pixels in v1.
            Hosting and database providers (the app host and Postgres) process traffic as
            subprocessors to keep the site online.
          </p>
          <p>
            Contact: privacy@jobrow.example (placeholder). To delete logs we control, email that
            address. Browser watchlists are deleted by clearing site data.
          </p>
        </div>
      </main>
    </AppShell>
  );
}
