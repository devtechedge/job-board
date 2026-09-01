import { Link, createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { DeskField } from "@/components/desk-field";
import { AppShell } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { MASTHEAD_LINE, RULED_PIN } from "@/lib/rates";

export const Route = createFileRoute("/placements")({
  head: () => ({
    meta: [
      { title: "Placements — Jobrow" },
      {
        name: "description",
        content:
          "Pin a role already on the Jobrow register, or buy a masthead line. Apply stays on the employer ATS. Checkout is not live.",
      },
    ],
  }),
  component: PlacementsPage,
});

const RULES = [
  {
    k: "01",
    t: "The role must already be on the register",
    d: "We do not host requisitions. If the public Greenhouse, Ashby, or Lever JSON does not list it as a US tech role, we cannot pin it.",
  },
  {
    k: "02",
    t: "Apply never comes here",
    d: "A pin moves the row above matching query results on Jobrow. The apply control still leaves for the employer ATS URL.",
  },
  {
    k: "03",
    t: "A clean miss ends the pin",
    d: "If a successful crawl no longer sees the posting, the pin stops. There is no automatic refund. Failed fetches do not end a pin.",
  },
  {
    k: "04",
    t: "No resume pipe",
    d: "We do not collect applications, CVs, or candidate lists. Counsel has not cleared live billing; this form is a rate request.",
  },
];

function PlacementsPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("sending");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/desk", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: "placement",
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          company: String(form.get("company") ?? ""),
          topic: String(form.get("sku") ?? RULED_PIN.id),
          listingUrl: String(form.get("listingUrl") ?? ""),
          body: String(form.get("body") ?? ""),
          fax: String(form.get("fax") ?? ""),
        }),
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
    <AppShell current="/placements">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Rate card · hiring desks</p>
        <h1 className="mt-2 max-w-3xl font-serif text-4xl font-semibold leading-tight">
          Pin a row that is already on the board.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
          This is advertising on an index, not a job-posting product. The listing stays on your ATS.
          Jobrow is not an employer, recruiter, or agency.
        </p>
        <p className="mt-4 border border-rule bg-inset px-3 py-2 text-sm">
          No card is charged in this build. Counsel has not cleared paid placement. Filing a request
          does not start a pin.
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

        <div className="mt-10 overflow-x-auto border border-rule">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-inset text-[11px] uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Item</th>
                <th className="px-3 py-2 font-medium">What you buy</th>
                <th className="px-3 py-2 font-medium">Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-rule">
                <th className="px-3 py-3 font-medium">{RULED_PIN.name}</th>
                <td className="px-3 py-3 text-muted">{RULED_PIN.blurb}</td>
                <td className="px-3 py-3 tabular-nums">
                  {RULED_PIN.price} / {RULED_PIN.cadence}
                </td>
              </tr>
              <tr className="border-t border-rule">
                <th className="px-3 py-3 font-medium">{MASTHEAD_LINE.name}</th>
                <td className="px-3 py-3 text-muted">{MASTHEAD_LINE.blurb}</td>
                <td className="px-3 py-3 tabular-nums">
                  {MASTHEAD_LINE.price} · {MASTHEAD_LINE.cadence}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
          <aside className="space-y-4 text-sm leading-relaxed">
            <p>
              Need the board on the register first?{" "}
              <Link to="/employers" className="text-pine underline underline-offset-4">
                Request a crawl slot
              </Link>
              .
            </p>
            <p>
              Seeker mail is a different card:{" "}
              <Link to="/pricing" className="text-pine underline underline-offset-4">
                Bound pass
              </Link>
              .
            </p>
            <p>Independent index. Not affiliated with any ATS vendor.</p>
          </aside>

          {status === "sent" ? (
            <p className="border border-rule bg-inset px-4 py-6 text-sm">
              Placement request filed. A pin is not running. We will only follow up if the listing
              is on the register and counsel has a billing path.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="border border-rule bg-paper px-4 sm:px-5">
              <p className="pt-4 font-serif text-xl font-semibold">File a placement request</p>
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
              <DeskField label="Item" htmlFor="sku">
                <select id="sku" name="sku" className="ledger-select" defaultValue={RULED_PIN.id}>
                  <option value={RULED_PIN.id}>
                    {RULED_PIN.name} · {RULED_PIN.price}
                  </option>
                  <option value={MASTHEAD_LINE.id}>
                    {MASTHEAD_LINE.name} · {MASTHEAD_LINE.price}
                  </option>
                  <option value={`${RULED_PIN.id}+${MASTHEAD_LINE.id}`}>
                    Both · $175
                  </option>
                </select>
              </DeskField>
              <DeskField
                label="Listing"
                htmlFor="listingUrl"
                hint="Jobrow /jobs/… URL or the employer ATS apply URL. Not Indeed or LinkedIn."
              >
                <input
                  id="listingUrl"
                  name="listingUrl"
                  type="url"
                  required
                  className="ledger-input"
                  placeholder="https://"
                />
              </DeskField>
              <DeskField label="Notes" htmlFor="body">
                <textarea id="body" name="body" rows={4} className="ledger-textarea" />
              </DeskField>
              <div className="hidden" aria-hidden="true">
                <input name="fax" tabIndex={-1} autoComplete="off" />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-rule py-4">
                <p className="text-xs text-muted">Waitlist. Not a charge.</p>
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
