import { createServerFn } from "@tanstack/react-start";
import { parseJobQuery } from "@/lib/query";

export const listJobsFn = createServerFn({ method: "GET" })
  .validator((data: unknown) =>
    parseJobQuery((data ?? {}) as Record<string, unknown>),
  )
  .handler(async ({ data }) => {
    const { ensureIndex } = await import("@/lib/crawl");
    const { searchJobs } = await import("@/lib/search");
    const boot = await ensureIndex();
    const result = await searchJobs(data);
    return { ...result, indexing: boot.indexing };
  });

export const homePageFn = createServerFn({ method: "GET" })
  .validator((data: unknown) =>
    parseJobQuery((data ?? {}) as Record<string, unknown>),
  )
  .handler(async ({ data }) => {
    const { ensureIndex } = await import("@/lib/crawl");
    const { searchJobs, homeDigest } = await import("@/lib/search");
    const boot = await ensureIndex();
    const [result, digest] = await Promise.all([searchJobs(data), homeDigest()]);
    return { ...result, indexing: boot.indexing, digest };
  });

export const getJobFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const id = typeof data === "string" ? data : String((data as { id?: string })?.id ?? "");
    if (!id) throw new Error("Missing job id");
    return { id };
  })
  .handler(async ({ data }) => {
    const { getJobById } = await import("@/lib/search");
    const { fillJobDescription } = await import("@/lib/crawl");
    await fillJobDescription(data.id).catch(() => undefined);
    const job = await getJobById(data.id);
    if (!job) throw new Error("Role not found");
    return job;
  });

export const listCompaniesFn = createServerFn({ method: "GET" }).handler(async () => {
  const { ensureIndex } = await import("@/lib/crawl");
  const { listCompanies } = await import("@/lib/search");
  const boot = await ensureIndex();
  const rows = await listCompanies();
  return {
    indexing: boot.indexing,
    pending: boot.indexing
      ? Math.max(
          1,
          rows.filter(
            (row) =>
              !row.last_ok_at ||
              Number(row.classifier_rev ?? 0) < 2 ||
              Number(row.open_count) === 0,
          ).length,
        )
      : rows.filter((row) => !row.last_ok_at || Number(row.classifier_rev ?? 0) < 2).length,
    companies: rows.map((row) => ({
      ...row,
      last_ok_at:
        row.last_ok_at instanceof Date
          ? row.last_ok_at.toISOString()
          : row.last_ok_at
            ? String(row.last_ok_at)
            : null,
    })),
  };
});

export const getCompanyFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const slug =
      typeof data === "string" ? data : String((data as { slug?: string })?.slug ?? "");
    if (!slug) throw new Error("Missing company");
    return { slug };
  })
  .handler(async ({ data }) => {
    const { ensureIndex } = await import("@/lib/crawl");
    const { getCompanyBySlug, listCompanyJobs } = await import("@/lib/search");
    await ensureIndex();
    const company = await getCompanyBySlug(data.slug);
    if (!company) throw new Error("Company not found");
    const jobs = await listCompanyJobs(String(company.id));
    return {
      company: {
        id: String(company.id),
        slug: String(company.slug),
        name: String(company.name),
        ats: String(company.ats),
        careers_url: company.careers_url ? String(company.careers_url) : null,
        website: company.website ? String(company.website) : null,
        hq_country: String(company.hq_country ?? "US"),
        last_ok_at:
          company.last_ok_at instanceof Date
            ? company.last_ok_at.toISOString()
            : company.last_ok_at
              ? String(company.last_ok_at)
              : null,
        last_error: company.last_error ? String(company.last_error) : null,
        enabled: Boolean(company.enabled),
        open_count: Number(company.open_count ?? 0),
        listed_count:
          company.listed_count == null ? null : Number(company.listed_count),
        board_token: String(company.board_token ?? ""),
      },
      jobs,
    };
  });
