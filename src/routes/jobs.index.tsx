import { Link, createFileRoute } from "@tanstack/react-router";
import { FilterBar } from "@/components/filter-bar";
import { PendingRegister } from "@/components/pending-register";
import { RegisterTable } from "@/components/register-table";
import { AppShell } from "@/components/site-footer";
import { listJobsFn } from "@/lib/jobs.functions";
import { compactSearch, parseJobQuery, type JobSearch } from "@/lib/query";

export const Route = createFileRoute("/jobs/")({
  validateSearch: (search: Record<string, unknown>): JobSearch =>
    compactSearch(parseJobQuery(search)),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => listJobsFn({ data: parseJobQuery(deps) }),
  head: () => ({
    meta: [{ title: "Job index — Jobrow" }],
  }),
  pendingComponent: PendingRegister,
  component: JobsIndex,
});

function JobsIndex() {
  const raw = Route.useSearch();
  const search = parseJobQuery(raw);
  const data = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <AppShell current="/jobs">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="font-serif text-3xl font-semibold">Full index</h1>
        <p className="mt-2 text-sm text-muted">
          {data.total.toLocaleString("en-US")} open US tech roles match this query.
        </p>
        <div className="mt-6">
          <FilterBar
            value={search}
            onChange={(patch) =>
              navigate({
                search: compactSearch({ ...search, ...patch, page: patch.page ?? 1 }),
              })
            }
          />
        </div>
        <div className="mt-6">
          <RegisterTable jobs={data.jobs} />
        </div>
        {pages > 1 ? (
          <nav className="mt-6 flex items-center justify-between text-sm">
            <Link
              to="/jobs"
              search={compactSearch({ ...search, page: Math.max(1, data.page - 1) })}
              className={data.page <= 1 ? "pointer-events-none text-rule-strong" : "hover:text-pine"}
            >
              Previous
            </Link>
            <span className="tabular-nums text-muted">
              Page {data.page} / {pages}
            </span>
            <Link
              to="/jobs"
              search={compactSearch({ ...search, page: Math.min(pages, data.page + 1) })}
              className={
                data.page >= pages ? "pointer-events-none text-rule-strong" : "hover:text-pine"
              }
            >
              Next
            </Link>
          </nav>
        ) : null}
      </main>
    </AppShell>
  );
}
