import { Link, createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { DeskField } from "@/components/desk-field";
import { AppShell } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Write the desk — Jobrow" },
      {
        name: "description",
        content:
          "Send Jobrow a correction, sourcing question, or legal note. We do not take applications or resumes.",
      },
    ],
  }),
  component: ContactPage,
});

const TOPICS = [
  { value: "listing", label: "A listing looks wrong" },
  { value: "source", label: "How you crawl a board" },
  { value: "legal", label: "Terms, privacy, takedown" },
  { value: "press", label: "Press or research" },
  { value: "other", label: "Something else" },
];

function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("sending");
    const form = new FormData(event.currentTarget);
    const payload = {
      kind: "write",
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      topic: String(form.get("topic") ?? ""),
      body: String(form.get("body") ?? ""),
      listingUrl: String(form.get("listingUrl") ?? ""),
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
        setError(data.error || "Could not file the note.");
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
    <AppShell current="/contact">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Desk</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold">Write the desk</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Corrections, sourcing questions, and legal mail. Jobrow is an index, not a hiring desk —
          applications and resumes sent here are discarded unread.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
          <aside className="space-y-4 text-sm leading-relaxed">
            <p>
              We read notes in batches. If a role is already gone from the employer board, refresh{" "}
              <Link to="/jobs" className="text-pine underline underline-offset-4">
                the index
              </Link>{" "}
              after the next crawl rather than mailing us the same title.
            </p>
            <p>
              Takedowns: we will drop a row that is no longer on the employer’s public JSON, or that
              you can show we are not licensed to keep. Point at the ATS URL, not a screenshot of
              another job site.
            </p>
            <p>
              Hiring teams adding a board: use{" "}
              <Link to="/employers" className="text-pine underline underline-offset-4">
                Request a crawl slot
              </Link>
              .
            </p>
          </aside>

          {status === "sent" ? (
            <p className="border border-rule bg-inset px-4 py-6 text-sm">
              Filed. If we need a follow-up we will use the address you gave. Do not expect a ticket
              number.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="border border-rule bg-paper px-4 sm:px-5">
              <DeskField label="From" htmlFor="name">
                <input id="name" name="name" className="ledger-input" autoComplete="name" />
              </DeskField>
              <DeskField label="Address" htmlFor="email" hint="Required. Used only to reply.">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="ledger-input"
                  autoComplete="email"
                />
              </DeskField>
              <DeskField label="Regarding" htmlFor="topic">
                <select id="topic" name="topic" className="ledger-select" defaultValue="listing">
                  {TOPICS.map((topic) => (
                    <option key={topic.value} value={topic.value}>
                      {topic.label}
                    </option>
                  ))}
                </select>
              </DeskField>
              <DeskField
                label="Listing"
                htmlFor="listingUrl"
                hint="Optional. A Jobrow or employer ATS URL, not Indeed or LinkedIn."
              >
                <input
                  id="listingUrl"
                  name="listingUrl"
                  type="url"
                  className="ledger-input"
                  placeholder="https://"
                />
              </DeskField>
              <DeskField label="Note" htmlFor="body">
                <textarea
                  id="body"
                  name="body"
                  required
                  minLength={12}
                  rows={7}
                  className="ledger-textarea"
                />
              </DeskField>
              <div className="hidden" aria-hidden="true">
                <input name="fax" tabIndex={-1} autoComplete="off" />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-rule py-4">
                <p className="text-xs text-muted">Not an employer. Not a recruiter.</p>
                <Button type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "Filing..." : "File note"}
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
