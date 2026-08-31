import { Link, createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { DeskField } from "@/components/desk-field";
import { AppShell } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/employers")({
  head: () => ({
    meta: [
      { title: "Request a crawl slot — Jobrow" },
      {
        name: "description",
        content:
          "Ask Jobrow to index a public Greenhouse, Ashby, or Lever board. Jobs stay on your ATS. v1 has no paid pins.",
      },
    ],
  }),
  component: EmployersPage,
});

const RULES = [
  {
    k: "01",
    t: "You already posted the job",
    d: "Jobrow does not host requisitions. If the role is not on a public Greenhouse, Ashby, Lever, or Workable JSON board, we cannot list it.",
  },
  {
    k: "02",
    t: "Apply stays on your domain",
    d: "Every apply control leaves this site for the URL your ATS already publishes. We do not collect applications or resumes.",
  },
  {
    k: "03",
    t: "US tech slice",
    d: "The public register keeps US-eligible software, data, design, research, and adjacent technical roles. Other postings on the same board are ignored.",
  },
  {
    k: "04",
    t: "No paid pin in v1",
    d: "There is no featured row, no homepage takeover, and no resume pipe for sale. Counsel has to review any paid placement before we ship one.",
  },
];

function EmployersPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("sending");
    const form = new FormData(event.currentTarget);
    const payload = {
      kind: "board_request",
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      company: String(form.get("company") ?? ""),
      ats: String(form.get("ats") ?? ""),
      boardToken: String(form.get("boardToken") ?? ""),
      careersUrl: String(form.get("careersUrl") ?? ""),
      website: String(form.get("website") ?? ""),
      country: String(form.get("country") ?? "US"),
      body: String(form.get("body") ?? ""),
      fax: String(form.get("fax") ?? ""),
    };
    try {
      const response = await fetch("/api/desk", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setStatus("error");
        setError(data.error || "Could not file the request.");
        return;
      }
      setStatus("sent");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
      setError("Network dropped. Try again.");
    }
  }

  return (
    <AppShell current="/employers">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Register</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold">Request a crawl slot</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          This is not a job-posting product. If your careers page already speaks Greenhouse, Ashby,
          or Lever JSON, we can add that board token to the crawl list. Inclusion is discretionary.
        </p>

        <ol className="mt-10 grid gap-px border border-rule bg-rule sm:grid-cols-2">
          {RULES.map((rule) => (
            <li key={rule.k} className="bg-paper px-4 py-4">
              <p className="font-mono text-[11px] text-muted">{rule.k}</p>
              <h2 className="mt-1 font-serif text-xl font-semibold">{rule.t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{rule.d}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
          <aside className="space-y-4 text-sm leading-relaxed">
            <p>
              Board token examples: Greenhouse uses the slug in{" "}
              <code className="font-mono text-xs">boards.greenhouse.io/slug</code>. Ashby uses the
              org in <code className="font-mono text-xs">jobs.ashbyhq.com/org</code>. Lever uses the
              site in <code className="font-mono text-xs">jobs.lever.co/site</code>.
            </p>
            <p>
              Aggregator URLs (Indeed, LinkedIn, ZipRecruiter, other indexes) are refused. We read
              employer JSON, not someone else’s scrape.
            </p>
            <p>
              Questions that are not a board add:{" "}
              <Link to="/contact" className="text-pine underline underline-offset-4">
                write the desk
              </Link>
              .
            </p>
          </aside>

          {status === "sent" ? (
            <p className="border border-rule bg-inset px-4 py-6 text-sm">
              Request filed. A slot is not a promise — we verify the public JSON before the next
              crawl window. You will hear from us only if the token is unreadable or we need a
              different board.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="border border-rule bg-paper px-4 sm:px-5">
              <DeskField label="Company" htmlFor="company">
                <input id="company" name="company" required className="ledger-input" />
              </DeskField>
              <DeskField label="Your name" htmlFor="name">
                <input id="name" name="name" className="ledger-input" autoComplete="name" />
              </DeskField>
              <DeskField label="Work email" htmlFor="email">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="ledger-input"
                  autoComplete="email"
                />
              </DeskField>
              <DeskField label="ATS" htmlFor="ats">
                <select id="ats" name="ats" className="ledger-select" defaultValue="greenhouse">
                  <option value="greenhouse">Greenhouse</option>
                  <option value="ashby">Ashby</option>
                  <option value="lever">Lever</option>
                  <option value="workable">Workable</option>
                </select>
              </DeskField>
              <DeskField
                label="Board token"
                htmlFor="boardToken"
                hint="Public slug only. Not an API key."
              >
                <input id="boardToken" name="boardToken" required className="ledger-input" />
              </DeskField>
              <DeskField label="Careers URL" htmlFor="careersUrl">
                <input
                  id="careersUrl"
                  name="careersUrl"
                  type="url"
                  required
                  className="ledger-input"
                  placeholder="https://"
                />
              </DeskField>
              <DeskField label="Website" htmlFor="website">
                <input
                  id="website"
                  name="website"
                  type="url"
                  className="ledger-input"
                  placeholder="https://"
                />
              </DeskField>
              <DeskField label="HQ country" htmlFor="country">
                <input id="country" name="country" defaultValue="US" className="ledger-input" />
              </DeskField>
              <DeskField label="Notes" htmlFor="body">
                <textarea
                  id="body"
                  name="body"
                  rows={4}
                  className="ledger-textarea"
                  placeholder="Anything the public board JSON does not show."
                />
              </DeskField>
              <div className="hidden" aria-hidden="true">
                <input name="fax" tabIndex={-1} autoComplete="off" />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-rule py-4">
                <p className="text-xs text-muted">Independent index. Not affiliated with any ATS vendor.</p>
                <Button type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "Filing..." : "File request"}
                </Button>
              </div>
              {error ? <p className="pb-4 text-sm text-danger">{error}</p> : null}
            </form>
          )}
        </div>
      </main>
    </AppShell>
  );
}
