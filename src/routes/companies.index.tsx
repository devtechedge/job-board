import { Link, createFileRoute } from "@tanstack/react-router";
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
  const companies = Route.useLoaderData();
  return (
    <AppShell current="/companies">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="font-serif text-3xl font-semibold">Companies</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Boards we read directly. Open counts are US tech roles still present on the latest
          successful crawl.
        </p>
        <div className="mt-6 overflow-x-auto border border-rule">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-inset text-[11px] uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Company</th>
                <th className="px-3 py-2 font-medium">Open</th>
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
                  <td className="px-3 py-3">
                    <SourceBadge ats={company.ats} />
                  </td>
                  <td className="px-3 py-3 text-muted">{ago(company.last_ok_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </AppShell>
  );
}
