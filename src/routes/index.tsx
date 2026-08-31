import { createFileRoute } from "@tanstack/react-router";
import { FilterBar } from "@/components/filter-bar";
import { PendingRegister } from "@/components/pending-register";
import { RegisterTable } from "@/components/register-table";
import { AppShell } from "@/components/site-footer";
import { listJobsFn } from "@/lib/jobs.functions";
import { compactSearch, parseJobQuery, type JobSearch } from "@/lib/query";
import { ago } from "@/lib/format";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): JobSearch =>
    compactSearch(parseJobQuery(search)),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => listJobsFn({ data: parseJobQuery(deps) }),
  head: () => ({
    meta: [{ title: "Open US tech roles — Jobrow" }],
  }),
  pendingComponent: PendingRegister,
  component: Home,
});

function Home() {
  const raw = Route.useSearch();
  const search = parseJobQuery(raw);
  const data = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const jobs = data.jobs.slice(0, 25);

  return (
    <AppShell current="/">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Public ATS register</p>
        <h1 className="mt-2 max-w-3xl font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Open US tech roles. From the hiring system.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted">
          Jobrow lists jobs that are still on the employer’s board. When the board drops a role, we
          drop it.
        </p>
        <p className="mt-3 text-sm tabular-nums text-muted">
          {data.stats.openCount.toLocaleString("en-US")} still open · {data.stats.companyCount}{" "}
          boards · last successful crawl {ago(data.stats.lastOkAt)}
        </p>
        {data.indexing ? (
          <p className="mt-3 border border-rule bg-inset px-3 py-2 text-sm">
            Reading remaining employer boards now. Open counts fill in as each board returns —
            the public demo crawls a couple of boards per page load.
          </p>
        ) : null}
        <div className="mt-8">
          <FilterBar
            value={search}
            onChange={(patch) =>
              navigate({
                search: compactSearch({ ...search, ...patch, page: 1 }),
              })
            }
          />
        </div>
        <div className="mt-6">
          <RegisterTable jobs={jobs} />
        </div>
      </main>
    </AppShell>
  );
}
