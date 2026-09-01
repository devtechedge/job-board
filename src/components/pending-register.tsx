import { AppShell } from "@/components/site-footer";

export function PendingRegister() {
  return (
    <AppShell>
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-sm text-muted">Loading…</p>
        <div className="mt-6 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 border border-rule bg-inset" />
          ))}
        </div>
      </main>
    </AppShell>
  );
}
