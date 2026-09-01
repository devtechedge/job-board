import { Link, createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { DeskField } from "@/components/desk-field";
import { AppShell } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { BOUND_PASS, SEEKER_ROWS } from "@/lib/rates";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Rate card — Jobrow" },
      {
        name: "description",
        content:
          "The Jobrow register is free. A Bound pass is courier mail plus a short closed drawer. No card is charged in this build.",
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
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
          kind: "bound_pass",
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          topic: BOUND_PASS.id,
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
    <AppShell current="/pricing">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Rate card · seekers</p>
        <h1 className="mt-2 max-w-3xl font-serif text-4xl font-semibold leading-tight">
          The register is free. The courier is billed.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
          Search, expand, and apply stay on the house. A Bound pass is optional mail when a saved
          query sees a new first-seen row, and a 14-day look at roles after a clean miss. Jobrow is
          not the employer.
        </p>
        <p className="mt-4 border border-rule bg-inset px-3 py-2 text-sm">
          No card is charged in this build. Counsel has not cleared subscriptions. Filing a request
          does not start billing.
        </p>

        <div className="mt-10 overflow-x-auto border border-rule">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-inset text-[11px] uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Line</th>
                <th className="px-3 py-2 font-medium">Register</th>
                <th className="px-3 py-2 font-medium">Bound pass</th>
              </tr>
            </thead>
            <tbody>
              {SEEKER_ROWS.map((row) => (
                <tr key={row.label} className="border-t border-rule">
                  <th className="px-3 py-2.5 font-medium">{row.label}</th>
                  <td className="px-3 py-2.5 text-muted">{row.register}</td>
                  <td className="px-3 py-2.5">{row.bound}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
          <aside className="space-y-4 text-sm leading-relaxed">
            <p>
              The browser watchlist does not leave this device. Courier mail, when it ships, uses
              only the address you file here. We do not sell resumes. There is no resume upload.
            </p>
            <p>
              Hiring teams: pins and masthead lines live on{" "}
              <Link to="/placements" className="text-pine underline underline-offset-4">
                the placement card
              </Link>
              , not on this page.
            </p>
            <p>
              Questions:{" "}
              <Link to="/contact" className="text-pine underline underline-offset-4">
                write the desk
              </Link>
              .
            </p>
          </aside>

          {status === "sent" ? (
            <p className="border border-rule bg-inset px-4 py-6 text-sm">
              Bound-pass request filed. This is a waitlist, not a subscription. We will not charge a
              card until counsel and billing exist.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="border border-rule bg-paper px-4 sm:px-5">
              <p className="pt-4 font-serif text-xl font-semibold">
                File a Bound pass request · {BOUND_PASS.price} {BOUND_PASS.cadence}
              </p>
              <DeskField label="Name" htmlFor="name">
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
              <DeskField
                label="Query"
                htmlFor="body"
                hint="Optional. The sentence you would save, e.g. senior remote backend."
              >
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
