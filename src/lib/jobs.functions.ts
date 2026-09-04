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
    const {
      searchJobs,
      homeDigest,
      isBareHomeQuery,
      listLatestDiverseJobs,
    } = await import("@/lib/search");
    const boot = await ensureIndex();
    const jobsPromise = isBareHomeQuery(data)
      ? listLatestDiverseJobs()
      : searchJobs(data);
    const [result, digest] = await Promise.all([jobsPromise, homeDigest()]);
    return { ...result, indexing: boot.indexing, digest };
  });

export const getJobFn = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const id = typeof data === "string" ? data : String((data as { id?: string })?.id ?? "");
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      throw new Error("Missing job id");
    }
    return { id };
  })
  .handler(async ({ data }) => {
    const { getJobById } = await import("@/lib/search");
    const { fillJobDescription } = await import("@/lib/crawl");
    await fillJobDescription(data.id).catch(() => undefined);
    const job = await getJobById(data.id);
    if (!job) throw new Error("Role not found");
    const { sanitizeHtml, htmlToText } = await import("@/lib/sanitize");
    const description_html = job.description_html ? sanitizeHtml(job.description_html) : null;
    return {
      ...job,
      description_html,
      description_text: job.description_text || htmlToText(description_html || job.description_html),
    };
  });

export const listCompaniesFn = createServerFn({ method: "GET" }).handler(async () => {
  const { ensureIndex, CLASSIFIER_REV } = await import("@/lib/crawl");
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
              Number(row.classifier_rev ?? 0) < CLASSIFIER_REV ||
              Number(row.open_count) === 0,
          ).length,
        )
      : rows.filter((row) => !row.last_ok_at || Number(row.classifier_rev ?? 0) < CLASSIFIER_REV).length,
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
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 80) throw new Error("Missing company");
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
        last_error: company.last_error ? "crawl failed" : null,
        enabled: Boolean(company.enabled),
        open_count: Number(company.open_count ?? 0),
        listed_count:
          company.listed_count == null ? null : Number(company.listed_count),
      },
      jobs,
    };
  });
