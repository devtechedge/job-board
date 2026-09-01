import { createFileRoute } from "@tanstack/react-router";
import { jsonError, jsonOk, optionsOk, parseJobId, publicJob } from "@/lib/api";

async function handle({ params }: { params: { id: string } }) {
  const id = parseJobId(params.id);
  if (!id) return jsonError("Invalid job id", 400);
  const { getJobById } = await import("@/lib/search");
  const { fillJobDescription } = await import("@/lib/crawl");
  await fillJobDescription(id).catch(() => undefined);
  const job = await getJobById(id);
  if (!job) return jsonError("Role not found", 404);
  return jsonOk({ job: publicJob(job, "detail") });
}

export const Route = createFileRoute("/api/jobs/$id")({
  server: {
    handlers: {
      GET: handle,
      OPTIONS: () => optionsOk(),
    },
  },
});
