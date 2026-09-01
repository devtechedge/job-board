import { Link, createFileRoute } from "@tanstack/react-router";
import { RegisterTable } from "@/components/register-table";
import { AppShell } from "@/components/site-footer";
import { SourceBadge } from "@/components/source-badge";
import { ago } from "@/lib/format";
import { getCompanyFn } from "@/lib/jobs.functions";

export const Route = createFileRoute("/companies/$slug")({
  loader: ({ params }) => getCompanyFn({ data: { slug: params.slug } }),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.company.name} roles — Jobrow`
          : "Company — Jobrow",
      },
    ],
  }),
  component: CompanyPage,
});

function CompanyPage() {
  const { company, jobs } = Route.useLoaderData();
  return (
    <AppShell current="/companies">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="text-sm">
          <Link to="/companies" className="text-muted hover:text-pine">
            Companies
          </Link>
        </p>
        <h1 className="mt-2 font-serif text-4xl font-semibold">{company.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
          <SourceBadge ats={company.ats} />
          <span>{company.open_count} US tech</span>
          {company.listed_count != null ? <span>{company.listed_count} listed</span> : null}
          <span>Last ok {ago(company.last_ok_at)}</span>
        </div>
        <dl className="mt-6 grid gap-3 border border-rule bg-inset p-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-muted">HQ focus</dt>
            <dd>{company.hq_country}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-muted">Careers</dt>
            <dd>
              {company.careers_url ? (
                <a
                  href={company.careers_url}
                  className="text-pine underline underline-offset-4"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Employer site
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-muted">Listed</dt>
            <dd className="tabular-nums">{company.listed_count ?? "—"}</dd>
          </div>
        </dl>
        {company.last_error ? (
          <p className="mt-3 text-sm text-danger">Last crawl error: {company.last_error}</p>
        ) : null}
        <div className="mt-8">
          <h2 className="mb-3 font-serif text-xl font-semibold">Open</h2>
          <RegisterTable jobs={jobs} empty="None." />
        </div>
      </main>
    </AppShell>
  );
}
