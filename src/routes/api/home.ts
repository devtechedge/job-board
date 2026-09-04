import { createFileRoute } from "@tanstack/react-router";
import { jsonOk, optionsOk, parseJobsRequest, publicHome, publicJob } from "@/lib/api";

async function handle({ request }: { request: Request }) {
  const query = parseJobsRequest(request);
  const { ensureIndex } = await import("@/lib/crawl");
  const {
    searchJobs,
    homeDigest,
    isBareHomeQuery,
    listLatestDiverseJobs,
  } = await import("@/lib/search");
  const boot = await ensureIndex();
  const jobsPromise = isBareHomeQuery(query)
    ? listLatestDiverseJobs()
    : searchJobs(query);
  const [result, digest] = await Promise.all([jobsPromise, homeDigest()]);
  return jsonOk({
    jobs: result.jobs.map((job) => publicJob(job, "list")),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    stats: result.stats,
    query,
    indexing: boot.indexing,
    digest: publicHome(digest),
  });
}

export const Route = createFileRoute("/api/home")({
  server: {
    handlers: {
      GET: handle,
      OPTIONS: () => optionsOk(),
    },
  },
});
