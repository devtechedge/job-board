import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { DeskField } from "@/components/desk-field";
import { AppShell } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/employers")({
  head: () => ({
    meta: [
      { title: "Add a board — Jobrow" },
      { name: "description", content: "Request a public Greenhouse, Ashby, or Lever board token." },
    ],
  }),
  component: EmployersPage,
});

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
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="font-serif text-3xl font-semibold">Add a board</h1>
        <p className="mt-2 text-sm text-muted">Public Greenhouse, Ashby, Lever, or Workable token.</p>
        {status === "sent" ? (
          <p className="mt-6 text-sm">Filed.</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 border border-rule bg-paper px-4 sm:px-5">
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
            <DeskField label="ATS" htmlFor="ats">
              <select id="ats" name="ats" className="ledger-select" defaultValue="greenhouse">
                <option value="greenhouse">Greenhouse</option>
                <option value="ashby">Ashby</option>
                <option value="lever">Lever</option>
                <option value="workable">Workable</option>
              </select>
            </DeskField>
            <DeskField label="Board token" htmlFor="boardToken" hint="Public slug, not an API key.">
              <input id="boardToken" name="boardToken" required className="ledger-input" />
            </DeskField>
            <DeskField label="Careers URL" htmlFor="careersUrl">
              <input id="careersUrl" name="careersUrl" type="url" required className="ledger-input" />
            </DeskField>
            <DeskField label="Website" htmlFor="website">
              <input id="website" name="website" type="url" className="ledger-input" />
            </DeskField>
            <DeskField label="HQ country" htmlFor="country">
              <input id="country" name="country" defaultValue="US" className="ledger-input" />
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
