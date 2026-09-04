import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { DeskField } from "@/components/desk-field";
import { AppShell } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Jobrow" },
      { name: "description", content: "Corrections and legal notes. Not applications." },
    ],
  }),
  component: ContactPage,
});

const TOPICS = [
  { value: "listing", label: "Listing error" },
  { value: "source", label: "Sourcing" },
  { value: "legal", label: "Legal" },
  { value: "press", label: "Press" },
  { value: "other", label: "Other" },
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
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="font-serif text-3xl font-semibold">Contact</h1>
        <p className="mt-2 text-sm text-muted">Corrections and legal. Not applications.</p>
        {status === "sent" ? (
          <p className="mt-6 text-sm">Filed.</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 border border-rule bg-paper px-4 sm:px-5">
            <DeskField label="From" htmlFor="name">
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
            <DeskField label="Regarding" htmlFor="topic">
              <select id="topic" name="topic" className="ledger-select" defaultValue="listing">
                {TOPICS.map((topic) => (
                  <option key={topic.value} value={topic.value}>
                    {topic.label}
                  </option>
                ))}
              </select>
            </DeskField>
            <DeskField label="Listing URL" htmlFor="listingUrl">
              <input id="listingUrl" name="listingUrl" type="url" className="ledger-input" />
            </DeskField>
            <DeskField label="Note" htmlFor="body">
              <textarea id="body" name="body" required minLength={12} rows={6} className="ledger-textarea" />
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
