import { Link, createFileRoute } from "@tanstack/react-router";
import { PendingRegister } from "@/components/pending-register";
import { RegisterTable } from "@/components/register-table";
import { AppShell } from "@/components/site-footer";
import { listClosedJobsFn } from "@/lib/jobs.functions";
import { pageHead } from "@/lib/seo";

type ClosedSearch = { page: number };

export const Route = createFileRoute("/closed")({
  validateSearch: (search: Record<string, unknown>): ClosedSearch => {
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
  head: () =>
    pageHead({
      title: "Closed US tech roles — Jobrow",
      description:
        "Roles Jobrow listed that later left the employer board after a successful crawl.",
      path: "/closed",
    }),
  pendingComponent: PendingRegister,
  component: ClosedPage,
});

function ClosedPage() {
  const { page } = Route.useSearch();
  const data = Route.useLoaderData();
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <AppShell current="/closed">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="font-serif text-3xl font-semibold">Closed</h1>
        <p className="mt-2 text-sm text-muted">
          Still listed here after they left the company board (filled or removed on a successful crawl).
        </p>
        <p className="mt-3 text-sm tabular-nums text-muted">
          {data.total.toLocaleString("en-US")} closed
        </p>
        <div className="mt-6">
          <RegisterTable
            jobs={data.jobs}
            variant="closed"
            empty="No closed roles yet."
          />
        </div>
        {pages > 1 ? (
          <nav className="mt-6 flex items-center justify-between text-sm">
            <Link
              to="/closed"
              search={{ page: Math.max(1, page - 1) }}
              className={page <= 1 ? "pointer-events-none text-rule-strong" : "hover:text-pine"}
            >
              Previous
            </Link>
            <span className="tabular-nums text-muted">
              Page {data.page} / {pages}
            </span>
            <Link
              to="/closed"
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
