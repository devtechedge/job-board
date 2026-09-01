import { createFileRoute } from "@tanstack/react-router";
import { jsonError, jsonOk, optionsOk, parseCompanySlug, publicCompany, publicJob } from "@/lib/api";

async function handle({ params }: { params: { slug: string } }) {
  const slug = parseCompanySlug(params.slug);
  if (!slug) return jsonError("Invalid company slug", 400);
  const { ensureIndex } = await import("@/lib/crawl");
  const { getCompanyBySlug, listCompanyJobs } = await import("@/lib/search");
  await ensureIndex();
  const company = await getCompanyBySlug(slug);
  if (!company) return jsonError("Company not found", 404);
  const jobs = await listCompanyJobs(String(company.id));
  return jsonOk({
    company: publicCompany(company),
    jobs: jobs.map((job) => publicJob(job, "list")),
  });
}

export const Route = createFileRoute("/api/companies/$slug")({
  server: {
    handlers: {
      GET: handle,
      OPTIONS: () => optionsOk(),
    },
  },
});
