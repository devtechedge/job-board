import { createFileRoute } from "@tanstack/react-router";
import { jsonOk, optionsOk, parseJobsRequest, publicJob } from "@/lib/api";

async function handle({ request }: { request: Request }) {
  const query = parseJobsRequest(request);
  const { ensureIndex } = await import("@/lib/crawl");
  const { searchJobs } = await import("@/lib/search");
  const boot = await ensureIndex();
  const result = await searchJobs(query);
  return jsonOk({
    jobs: result.jobs.map((job) => publicJob(job, "list")),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    stats: result.stats,
    query,
    indexing: boot.indexing,
  });
}

export const Route = createFileRoute("/api/jobs/")({
  server: {
    handlers: {
      GET: handle,
      OPTIONS: () => optionsOk(),
    },
  },
});
