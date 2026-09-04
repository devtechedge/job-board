import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { DeskField } from "@/components/desk-field";
import { AppShell } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { MASTHEAD_LINE, RULED_PIN } from "@/lib/rates";

export const Route = createFileRoute("/placements")({
  head: () => ({
    meta: [
      { title: "Promote — Jobrow" },
      { name: "description", content: "Ruled pin and masthead line. Waitlist. No live checkout." },
    ],
  }),
  component: PlacementsPage,
});

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
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="font-serif text-3xl font-semibold">Promote</h1>
        <p className="mt-2 text-sm text-muted">Role must already be listed on Jobs. No card charged.</p>
        <div className="mt-6 overflow-x-auto border border-rule">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-inset text-[11px] uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Item</th>
                <th className="px-3 py-2 font-medium">Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-rule">
                <th className="px-3 py-3 font-medium">{RULED_PIN.name}</th>
                <td className="px-3 py-3 tabular-nums">
                  {RULED_PIN.price} / {RULED_PIN.cadence}
                </td>
              </tr>
              <tr className="border-t border-rule">
                <th className="px-3 py-3 font-medium">{MASTHEAD_LINE.name}</th>
                <td className="px-3 py-3 tabular-nums">
                  {MASTHEAD_LINE.price} · {MASTHEAD_LINE.cadence}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {status === "sent" ? (
          <p className="mt-6 text-sm">Filed.</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 border border-rule bg-paper px-4 sm:px-5">
            <DeskField label="Company" htmlFor="company">
              <input id="company" name="company" required className="ledger-input" />
            </DeskField>
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
            <DeskField label="Item" htmlFor="sku">
              <select id="sku" name="sku" className="ledger-select" defaultValue={RULED_PIN.id}>
                <option value={RULED_PIN.id}>
                  {RULED_PIN.name} · {RULED_PIN.price}
                </option>
                <option value={MASTHEAD_LINE.id}>
                  {MASTHEAD_LINE.name} · {MASTHEAD_LINE.price}
                </option>
                <option value={`${RULED_PIN.id}+${MASTHEAD_LINE.id}`}>Both · $175</option>
              </select>
            </DeskField>
            <DeskField label="Listing URL" htmlFor="listingUrl">
              <input id="listingUrl" name="listingUrl" type="url" required className="ledger-input" />
            </DeskField>
            <DeskField label="Notes" htmlFor="body">
              <textarea id="body" name="body" rows={3} className="ledger-textarea" />
            </DeskField>
            <div className="hidden" aria-hidden="true">
              <input name="fax" tabIndex={-1} autoComplete="off" />
            </div>
            <div className="flex justify-end border-t border-rule py-4">
              <Button type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Filing..." : "Send"}
              </Button>
            </div>
            {error ? <p className="pb-4 text-sm text-danger">{error}</p> : null}
          </form>
        )}
      </main>
    </AppShell>
  );
}
