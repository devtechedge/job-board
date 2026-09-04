import { Link, createFileRoute } from "@tanstack/react-router";
import { FilterBar } from "@/components/filter-bar";
import { BoardStrip, EditionMasthead, EditionTally, FunctionContents } from "@/components/home-front";
import { PendingRegister } from "@/components/pending-register";
import { RegisterTable } from "@/components/register-table";
import { AppShell } from "@/components/site-footer";
import { homePageFn } from "@/lib/jobs.functions";
import { compactSearch, parseJobQuery, type JobSearch } from "@/lib/query";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): JobSearch =>
    compactSearch(parseJobQuery(search)),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => homePageFn({ data: parseJobQuery(deps) }),
  head: () => ({
    meta: [
      { title: "Jobrow" },
      { name: "description", content: "US tech roles still on the employer ATS board." },
    ],
  }),
  pendingComponent: PendingRegister,
  component: Home,
});

function hasQuery(search: ReturnType<typeof parseJobQuery>): boolean {
  return Boolean(
    search.q ||
      search.fn ||
      search.seniority ||
      search.workplace ||
      search.location ||
      search.salaryMin ||
      search.posted ||
      search.ats ||
      search.company,
  );
}

function Home() {
  const raw = Route.useSearch();
  const search = parseJobQuery(raw);
  const data = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const filtered = hasQuery(search);
  const jobs = data.jobs.slice(0, 12);

  return (
    <AppShell current="/">
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <EditionMasthead digest={data.digest} />
        <div className="mt-6">
          <EditionTally digest={data.digest} />
        </div>
        {data.indexing ? (
          <p className="mt-4 text-sm text-muted">Reading boards…</p>
        ) : null}
        <div className="mt-6">
          <FilterBar
            value={search}
            onChange={(patch) =>
              navigate({
                search: compactSearch({ ...search, ...patch, page: 1 }),
              })
            }
          />
        </div>
        <section className="mt-8">
          <div className="mb-3 flex items-end justify-between gap-3">
            <h1 className="font-serif text-2xl font-semibold">
              {filtered ? "Results" : "Latest"}
            </h1>
            <Link
              to="/jobs"
              search={compactSearch(search)}
              className="text-sm text-muted hover:text-pine"
            >
              Search
              {filtered ? ` · ${data.total.toLocaleString("en-US")}` : ""}
            </Link>
          </div>
          <RegisterTable jobs={jobs} />
        </section>
        <div className="mt-10">
          <FunctionContents items={data.digest.functions} />
        </div>
        <div className="mt-10 mb-4">
          <BoardStrip boards={data.digest.boards} />
        </div>
      </main>
    </AppShell>
  );
}
