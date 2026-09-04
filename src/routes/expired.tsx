import { Link, createFileRoute } from "@tanstack/react-router";
import { PendingRegister } from "@/components/pending-register";
import { RegisterTable } from "@/components/register-table";
import { AppShell } from "@/components/site-footer";
import { listClosedJobsFn } from "@/lib/jobs.functions";

type ExpiredSearch = { page: number };

export const Route = createFileRoute("/expired")({
  validateSearch: (search: Record<string, unknown>): ExpiredSearch => {
    const raw = search.page;
    const page =
      typeof raw === "number"
        ? raw
        : typeof raw === "string" && raw
          ? Number(raw)
          : 1;
    return { page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1 };
  },
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => listClosedJobsFn({ data: { page: deps.page } }),
  head: () => ({
    meta: [
      { title: "Expired — Jobrow" },
      {
        name: "description",
        content:
          "Roles Jobrow listed that later left the employer board — filled or pulled down.",
      },
    ],
  }),
  pendingComponent: PendingRegister,
  component: ExpiredPage,
});

function ExpiredPage() {
  const { page } = Route.useSearch();
  const data = Route.useLoaderData();
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <AppShell current="/expired">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="font-serif text-3xl font-semibold">Expired</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Roles that were on Jobrow and later disappeared from the company board after a
          successful crawl (filled or removed). Proof the list is kept honest — not a
          graveyard of stale links.
        </p>
        <p className="mt-3 text-sm tabular-nums text-muted">
          {data.total.toLocaleString("en-US")} expired
        </p>
        <div className="mt-6">
          <RegisterTable
            jobs={data.jobs}
            variant="expired"
            empty="No expired roles yet."
          />
        </div>
        {pages > 1 ? (
          <nav className="mt-6 flex items-center justify-between text-sm">
            <Link
              to="/expired"
              search={{ page: Math.max(1, page - 1) }}
              className={page <= 1 ? "pointer-events-none text-rule-strong" : "hover:text-pine"}
            >
              Previous
            </Link>
            <span className="tabular-nums text-muted">
              Page {data.page} / {pages}
            </span>
            <Link
              to="/expired"
              search={{ page: Math.min(pages, page + 1) }}
              className={
                page >= pages ? "pointer-events-none text-rule-strong" : "hover:text-pine"
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
