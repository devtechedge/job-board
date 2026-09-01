import { createFileRoute } from "@tanstack/react-router";
import { jsonOk, optionsOk, publicCompany } from "@/lib/api";

async function handle() {
  const { ensureIndex } = await import("@/lib/crawl");
  const { listCompanies } = await import("@/lib/search");
  const boot = await ensureIndex();
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
