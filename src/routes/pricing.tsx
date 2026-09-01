import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { DeskField } from "@/components/desk-field";
import { AppShell } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { BOUND_PASS, SEEKER_ROWS } from "@/lib/rates";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Rates — Jobrow" },
      { name: "description", content: "Free register. Bound pass waitlist. No live checkout." },
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
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="font-serif text-3xl font-semibold">Rates</h1>
        <p className="mt-2 text-sm text-muted">No card charged. Waitlist only.</p>
        <div className="mt-6 overflow-x-auto border border-rule">
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
        {status === "sent" ? (
          <p className="mt-6 text-sm">Filed.</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 border border-rule bg-paper px-4 sm:px-5">
            <DeskField label="Name" htmlFor="name">
              <input id="name" name="name" className="ledger-input" autoComplete="name" />
            </DeskField>
            <DeskField label="Email" htmlFor="email">
              <input
                id="email"
                name="email"
                type="email"
                required
                className="ledger-input"
                autoComplete="email"
              />
            </DeskField>
            <DeskField label="Query" htmlFor="body">
              <textarea id="body" name="body" rows={3} className="ledger-textarea" />
            </DeskField>
            <div className="hidden" aria-hidden="true">
              <input name="fax" tabIndex={-1} autoComplete="off" />
            </div>
            <div className="flex justify-end border-t border-rule py-4">
              <Button type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Filing..." : "Request Bound pass"}
              </Button>
            </div>
            {error ? <p className="pb-4 text-sm text-danger">{error}</p> : null}
          </form>
        )}
      </main>
    </AppShell>
  );
}
