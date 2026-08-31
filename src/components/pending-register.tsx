import { AppShell } from "@/components/site-footer";

export function PendingRegister() {
  return (
    <AppShell>
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Jobrow</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">Reading employer boards</h1>
        <p className="mt-3 max-w-lg text-sm text-muted">
          First load seeds the company register and pulls live listings from public ATS JSON. This
          is not a stored mock.
        </p>
        <div className="mt-8 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 border border-rule bg-inset" />
          ))}
        </div>
      </main>
    </AppShell>
  );
}
