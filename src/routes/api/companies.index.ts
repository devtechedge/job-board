import { createFileRoute } from "@tanstack/react-router";
import { guardPublicApi, jsonOk, optionsOk, publicCompany } from "@/lib/api";

async function handle({ request }: { request: Request }) {
  const limited = guardPublicApi(request);
  if (limited) return limited;
  const { ensureBooted } = await import("@/lib/crawl");
  const { listCompanies } = await import("@/lib/search");
  const boot = await ensureBooted();
  const rows = await listCompanies();
  return jsonOk({
    indexing: boot.indexing,
    companies: rows.map((row) => publicCompany(row)),
  });
}

export const Route = createFileRoute("/api/companies/")({
  server: {
    handlers: {
      GET: handle,
      OPTIONS: () => optionsOk(),
    },
  },
});
