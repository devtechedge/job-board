import { companyLogoSrc } from "@/lib/logo";
import { editionDateLabel } from "@/lib/format";
import { jobQueryFromSearchParams, type JobQuery } from "@/lib/query";
import { formatPay } from "@/lib/salary";
import { htmlToText, sanitizeHtml } from "@/lib/sanitize";
import { SLUG_RE, UUID_RE } from "@/lib/safe";
import { iso } from "@/lib/utils";
import type { JobListItem, HomeDigest } from "@/lib/search";

export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
  "Access-Control-Max-Age": "86400",
};

export type PublicCompanyCard = {
  id?: string;
  slug: string;
  name: string;
  website: string | null;
  logo_url: string | null;
};

export type PublicJob = {
  id: string;
  title: string;
  slug: string;
  apply_url: string;
  location_raw: string | null;
  locations: string[];
  workplace: string;
  salary_min_cents: number | null;
  salary_max_cents: number | null;
  salary_currency: string;
  salary_source: string;
  salary_label: string;
  function: string | null;
  seniority: string | null;
  skills: string[];
  summary: string | null;
  posted_at: string | null;
  first_seen_at: string;
  last_seen_at: string;
  closed_at: string | null;
  status: string;
  source_ats: string;
  company: PublicCompanyCard & { id: string };
  description_html?: string | null;
  description_text?: string | null;
};

export type PublicCompany = {
  id: string;
  slug: string;
  name: string;
  ats: string;
  careers_url: string | null;
  website: string | null;
  logo_url: string | null;
  hq_country: string;
  last_ok_at: string | null;
  enabled: boolean;
  open_count: number;
  listed_count: number | null;
};

export function jsonOk(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=30",
    },
  });
}

export function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export function optionsOk(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export function publicJob(job: JobListItem, mode: "list" | "detail"): PublicJob {
  const company = {
    id: job.company_id,
    name: job.company_name,
    slug: job.company_slug,
    website: job.company_website,
    logo_url: companyLogoSrc({
      logoUrl: job.company_logo_url,
      website: job.company_website,
    }),
  };
  const base: PublicJob = {
    id: job.id,
    title: job.title,
    slug: job.slug,
    apply_url: job.apply_url,
    location_raw: job.location_raw,
    locations: job.locations,
    workplace: job.workplace,
    salary_min_cents: job.salary_min_cents,
    salary_max_cents: job.salary_max_cents,
    salary_currency: job.salary_currency,
    salary_source: job.salary_source,
    salary_label: formatPay(
      job.salary_min_cents,
      job.salary_max_cents,
      job.salary_currency,
      job.salary_source,
    ),
    function: job.function,
    seniority: job.seniority,
    skills: job.skills,
    summary: job.summary,
    posted_at: job.posted_at,
    first_seen_at: job.first_seen_at,
    last_seen_at: job.last_seen_at,
    closed_at: job.closed_at,
    status: job.status,
    source_ats: job.source_ats,
    company,
  };
  if (mode === "list") return base;
  const description_html = job.description_html ? sanitizeHtml(job.description_html) : null;
  return {
    ...base,
    description_html,
    description_text: job.description_text || htmlToText(description_html || job.description_html),
  };
}

export function publicCompany(row: Record<string, unknown>): PublicCompany {
  const website = row.website ? String(row.website) : null;
  const logoUrl = row.logo_url ? String(row.logo_url) : null;
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    ats: String(row.ats),
    careers_url: row.careers_url ? String(row.careers_url) : null,
    website,
    logo_url: companyLogoSrc({ logoUrl, website }),
    hq_country: String(row.hq_country ?? "US"),
    last_ok_at: iso(row.last_ok_at),
    enabled: Boolean(row.enabled),
    open_count: Number(row.open_count ?? 0),
    listed_count: row.listed_count == null ? null : Number(row.listed_count),
  };
}

export function publicHome(digest: HomeDigest) {
  return {
    openCount: digest.openCount,
    companyCount: digest.companyCount,
    lastOkAt: digest.lastOkAt,
    closedCount: digest.closedCount,
    freshCount: digest.freshCount,
    lastWindowOpened: digest.lastWindowOpened,
    lastWindowClosed: digest.lastWindowClosed,
    lastWindowAt: digest.lastWindowAt,
    functions: digest.functions,
    boards: digest.boards.map((board) => ({
      slug: board.slug,
      name: board.name,
      ats: board.ats,
      open_count: board.open_count,
      website: board.website,
      logo_url: companyLogoSrc({ logoUrl: board.logo_url, website: board.website }),
    })),
    editionAt: digest.editionAt,
    editionLabel: editionDateLabel(digest.editionAt),
  };
}

export function parseJobsRequest(request: Request): JobQuery {
  return jobQueryFromSearchParams(new URL(request.url).searchParams);
}

export function parseJobId(id: string | undefined): string | null {
  const value = (id ?? "").trim();
  return UUID_RE.test(value) ? value : null;
}

export function parseCompanySlug(slug: string | undefined): string | null {
  const value = (slug ?? "").trim().toLowerCase();
  if (!SLUG_RE.test(value) || value.length > 80) return null;
  return value;
}
