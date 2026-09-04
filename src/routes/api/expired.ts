import { createFileRoute } from "@tanstack/react-router";
import { jsonOk, optionsOk, publicJob } from "@/lib/api";

async function handle({ request }: { request: Request }) {
  const url = new URL(request.url);
  const pageRaw = url.searchParams.get("page");
  const page = pageRaw ? Number(pageRaw) : 1;
  const { ensureIndex } = await import("@/lib/crawl");
  const { listClosedJobs } = await import("@/lib/search");
  const boot = await ensureIndex();
  const result = await listClosedJobs(
    Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
  );
  return jsonOk({
    jobs: result.jobs.map((job) => publicJob(job, "list")),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    stats: result.stats,
    indexing: boot.indexing,
  });
}

export const Route = createFileRoute("/api/expired")({
  server: {
    handlers: {
      GET: handle,
      OPTIONS: () => optionsOk(),
    },
  },
});
