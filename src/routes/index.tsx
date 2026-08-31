import { Link, createFileRoute } from "@tanstack/react-router";
import { FilterBar } from "@/components/filter-bar";
import {
  BoardStrip,
  EditionMasthead,
  EditionTally,
  FunctionContents,
  HowToRead,
} from "@/components/home-front";
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
      { title: "Jobrow — US tech roles still on the employer board" },
      {
        name: "description",
        content:
          "A public register of US tech jobs read from Greenhouse, Ashby, and Lever JSON. When the board drops a role, the register drops it.",
      },
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
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <EditionMasthead digest={data.digest} />

        <div className="mt-8 max-w-3xl">
          <h1 className="font-serif text-4xl font-semibold leading-[1.12] tracking-tight text-ink sm:text-5xl">
            The board still lists it. So does the register.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
            Jobrow is a public index of US tech roles copied from the employer’s own ATS JSON — not
            from another job site. Apply leaves this page. When a successful crawl no longer sees
            the posting, the row comes off.
          </p>
        </div>

        <div className="mt-8">
          <EditionTally digest={data.digest} />
        </div>

        {data.indexing ? (
          <p className="mt-6 border border-rule bg-inset px-3 py-2 text-sm">
            Reading remaining employer boards now. Counts fill in as each JSON endpoint returns.
          </p>
        ) : null}

        <div className="mt-10">
          <FilterBar
            value={search}
            onChange={(patch) =>
              navigate({
                search: compactSearch({ ...search, ...patch, page: 1 }),
              })
            }
          />
        </div>

        <section className="mt-10">
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2 className="font-serif text-2xl font-semibold">
              {filtered ? "This query" : "Latest on the register"}
            </h2>
            <Link
              to="/jobs"
              search={compactSearch(search)}
              className="text-sm text-muted hover:text-pine"
            >
              Full index
              {filtered ? ` · ${data.total.toLocaleString("en-US")} matches` : ""}
            </Link>
          </div>
          <RegisterTable jobs={jobs} />
        </section>

        <div className="mt-14">
          <FunctionContents items={data.digest.functions} />
        </div>
        <div className="mt-14">
          <BoardStrip boards={data.digest.boards} />
        </div>
        <div className="mt-14 mb-4">
          <HowToRead />
        </div>
      </main>
    </AppShell>
  );
}
