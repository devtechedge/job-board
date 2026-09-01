import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/site-footer";
import { SourceBadge } from "@/components/source-badge";
import { listCompaniesFn } from "@/lib/jobs.functions";
import { ago } from "@/lib/format";

export const Route = createFileRoute("/companies/")({
  loader: () => listCompaniesFn(),
  head: () => ({ meta: [{ title: "Companies — Jobrow" }] }),
  component: CompaniesPage,
});

function CompaniesPage() {
  const { companies, indexing, pending } = Route.useLoaderData();
  const router = useRouter();

  useEffect(() => {
    if (!indexing && pending === 0) return;
    const timer = window.setTimeout(() => {
      void router.invalidate();
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [indexing, pending, router]);

  return (
    <AppShell current="/companies">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="font-serif text-3xl font-semibold">Companies</h1>
        {pending > 0 ? (
          <p className="mt-3 text-sm text-muted">Reading {pending} boards…</p>
        ) : null}
        <div className="mt-6 overflow-x-auto border border-rule">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-inset text-[11px] uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Company</th>
                <th className="px-3 py-2 font-medium">US tech</th>
                <th className="px-3 py-2 font-medium">Listed</th>
                <th className="px-3 py-2 font-medium">Board</th>
                <th className="px-3 py-2 font-medium">Last ok</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id} className="border-t border-rule">
                  <td className="px-3 py-3">
                    <Link
                      to="/companies/$slug"
                      params={{ slug: company.slug }}
                      className="font-medium hover:text-pine"
                    >
                      {company.name}
                    </Link>
                  </td>
                  <td className="px-3 py-3 tabular-nums">{company.open_count}</td>
                  <td className="px-3 py-3 tabular-nums text-muted">
                    {company.listed_count == null ? "—" : company.listed_count}
                  </td>
                  <td className="px-3 py-3">
                    <SourceBadge ats={company.ats} />
                  </td>
                  <td className="px-3 py-3 text-muted">
                    {company.last_ok_at
                      ? ago(company.last_ok_at)
                      : company.last_error
                        ? "failed"
                        : "queued"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </AppShell>
  );
}
