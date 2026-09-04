import { getSql } from "@/lib/db";
import { PAGE_SIZE, type JobQuery } from "@/lib/query";
import { asStringArray, iso } from "@/lib/utils";
import type { Ats, JobRow, SalarySource, Workplace } from "@/lib/ats/types";

export type JobListItem = JobRow & {
  company_name: string;
  company_slug: string;
  company_website: string | null;
  company_logo_url: string | null;
};

export type SearchResult = {
  jobs: JobListItem[];
  total: number;
  page: number;
  pageSize: number;
  stats: {
    openCount: number;
    companyCount: number;
    lastOkAt: string | null;
  };
};

function mapJob(row: Record<string, unknown>): JobListItem {
  return {
    id: String(row.id),
    company_id: String(row.company_id),
    source_ats: row.source_ats as Ats,
    source_id: String(row.source_id),
    title: String(row.title),
    slug: String(row.slug),
    apply_url: String(row.apply_url),
    location_raw: row.location_raw ? String(row.location_raw) : null,
    locations: asStringArray(row.locations),
    workplace: (row.workplace as Workplace) ?? "unknown",
    salary_min_cents: row.salary_min_cents == null ? null : Number(row.salary_min_cents),
    salary_max_cents: row.salary_max_cents == null ? null : Number(row.salary_max_cents),
    salary_currency: String(row.salary_currency ?? "USD"),
    salary_source: (row.salary_source as SalarySource) ?? "none",
    yoe_min: row.yoe_min == null ? null : Number(row.yoe_min),
    function: row.function ? String(row.function) : null,
    seniority: row.seniority ? String(row.seniority) : null,
    skills: asStringArray(row.skills),
    description_html: row.description_html ? String(row.description_html) : null,
    description_text: row.description_text ? String(row.description_text) : null,
    summary: row.summary ? String(row.summary) : null,
    posted_at: iso(row.posted_at),
    first_seen_at: iso(row.first_seen_at) ?? new Date().toISOString(),
    last_seen_at: iso(row.last_seen_at) ?? new Date().toISOString(),
    closed_at: iso(row.closed_at),
    status: row.status === "closed" ? "closed" : "open",
    us_eligible: Boolean(row.us_eligible),
    tech_eligible: Boolean(row.tech_eligible),
    company_name: String(row.company_name ?? ""),
    company_slug: String(row.company_slug ?? ""),
    company_website: row.company_website ? String(row.company_website) : null,
    company_logo_url: row.company_logo_url ? String(row.company_logo_url) : null,
  };
}

function postedSql(posted: string, params: unknown[]): string | null {
  const map: Record<string, string> = {
    "1d": "1 day",
    "3d": "3 days",
    "7d": "7 days",
    "14d": "14 days",
    "30d": "30 days",
  };
  const interval = map[posted];
  if (!interval) return null;
  params.push(interval);
  return `j.first_seen_at >= now() - $` + params.length + `::interval`;
}

export async function searchJobs(query: JobQuery): Promise<SearchResult> {
  const sql = await getSql();
  const params: unknown[] = [];
  const where = [
    "j.status = 'open'",
    "j.us_eligible = true",
    "j.tech_eligible = true",
  ];
  if (query.q) {
    params.push(`%${query.q.replace(/[%_]/g, "")}%`);
    const i = params.length;
    where.push(
      `(j.search_text ilike $${i} or j.title ilike $${i} or c.name ilike $${i} or j.location_raw ilike $${i})`,
    );
  }
  if (query.fn) {
    params.push(query.fn);
    where.push(`j.function = $${params.length}`);
  }
  if (query.seniority) {
    params.push(query.seniority);
    where.push(`j.seniority = $${params.length}`);
  }
  if (query.workplace) {
    params.push(query.workplace);
    where.push(`j.workplace = $${params.length}`);
  }
  if (query.location) {
    params.push(`%${query.location.replace(/[%_]/g, "")}%`);
    where.push(`j.location_raw ilike $${params.length}`);
  }
  if (query.salaryMin) {
    params.push(query.salaryMin * 100);
    where.push(`j.salary_min_cents >= $${params.length}`);
  }
  const posted = postedSql(query.posted, params);
  if (posted) where.push(posted);
  if (query.ats) {
    params.push(query.ats);
    where.push(`j.source_ats = $${params.length}`);
  }
  if (query.company) {
    params.push(query.company);
    where.push(`c.slug = $${params.length}`);
  }

  const order =
    query.sort === "first_seen"
      ? "j.first_seen_at desc"
      : query.sort === "salary"
        ? "j.salary_min_cents desc nulls last, j.last_seen_at desc"
        : query.sort === "title"
          ? "j.title asc"
          : "j.last_seen_at desc, j.posted_at desc nulls last, j.first_seen_at desc";

  const whereSql = where.join(" and ");
  const countRows = await sql.query<{ n: number }>(
    `select count(*)::int as n
     from jobs j join companies c on c.id = j.company_id
     where ${whereSql}`,
    params,
  );
  const total = countRows[0]?.n ?? 0;
  const page = Math.min(query.page, Math.max(1, Math.ceil(total / PAGE_SIZE) || 1));
  const offset = (page - 1) * PAGE_SIZE;
  const listParams = [...params, PAGE_SIZE, offset];
  const rows = await sql.query<Record<string, unknown>>(
    `select j.*, c.name as company_name, c.slug as company_slug,
            c.website as company_website, c.logo_url as company_logo_url
     from jobs j join companies c on c.id = j.company_id
     where ${whereSql}
     order by ${order}
     limit $${listParams.length - 1} offset $${listParams.length}`,
    listParams,
  );
  const statsRows = await sql.query<{
    openCount: number;
    companyCount: number;
    lastOkAt: unknown;
  }>(
    `select
      (select count(*)::int from jobs where status = 'open' and us_eligible and tech_eligible) as "openCount",
      (select count(*)::int from companies where enabled) as "companyCount",
      (select max(last_ok_at) from companies) as "lastOkAt"`,
  );
  return {
    jobs: rows.map(mapJob),
    total,
    page,
    pageSize: PAGE_SIZE,
    stats: {
      openCount: statsRows[0]?.openCount ?? 0,
      companyCount: statsRows[0]?.companyCount ?? 0,
      lastOkAt: iso(statsRows[0]?.lastOkAt),
    },
  };
}

export async function getJobById(id: string): Promise<JobListItem | null> {
  const sql = await getSql();
  const rows = await sql.query<Record<string, unknown>>(
    `select j.*, c.name as company_name, c.slug as company_slug,
            c.website as company_website, c.logo_url as company_logo_url
     from jobs j join companies c on c.id = j.company_id
     where j.id = $1`,
    [id],
  );
  return rows[0] ? mapJob(rows[0]) : null;
}

export async function listCompanies() {
  const sql = await getSql();
  return sql.query<{
    id: string;
    slug: string;
    name: string;
    ats: Ats;
    careers_url: string | null;
    website: string | null;
    hq_country: string;
    last_ok_at: unknown;
    last_error: string | null;
    enabled: boolean;
    open_count: number;
    listed_count: number | null;
    classifier_rev: number;
  }>(
    `select c.id, c.slug, c.name, c.ats, c.careers_url, c.website, c.hq_country,
            c.last_ok_at, c.last_error, c.enabled,
            c.listed_count, coalesce(c.classifier_rev, 0)::int as classifier_rev,
            count(j.id) filter (
              where j.status = 'open' and j.us_eligible and j.tech_eligible
            )::int as open_count
     from companies c
     left join jobs j on j.company_id = c.id
     group by c.id
     order by c.name asc`,
  );
}

export async function getCompanyBySlug(slug: string) {
  const sql = await getSql();
  const rows = await sql.query<Record<string, unknown>>(
    `select c.*, count(j.id) filter (
        where j.status = 'open' and j.us_eligible and j.tech_eligible
      )::int as open_count
     from companies c
     left join jobs j on j.company_id = c.id
     where c.slug = $1
     group by c.id`,
    [slug],
  );
  return rows[0] ?? null;
}

export async function listCompanyJobs(companyId: string): Promise<JobListItem[]> {
  const sql = await getSql();
  const rows = await sql.query<Record<string, unknown>>(
    `select j.*, c.name as company_name, c.slug as company_slug,
            c.website as company_website, c.logo_url as company_logo_url
     from jobs j join companies c on c.id = j.company_id
     where j.company_id = $1 and j.status = 'open' and j.us_eligible and j.tech_eligible
     order by j.last_seen_at desc
     limit 5000`,
    [companyId],
  );
  return rows.map(mapJob);
}

export async function listOpenJobIds(limit = 5000): Promise<Array<{ id: string; last_seen_at: unknown }>> {
  const sql = await getSql();
  return sql.query(
    `select id, last_seen_at from jobs
     where status = 'open' and us_eligible and tech_eligible
     order by last_seen_at desc
     limit $1`,
    [limit],
  );
}

export { mapJob };

export type HomeDigest = {
  openCount: number;
  companyCount: number;
  lastOkAt: string | null;
  closedCount: number;
  freshCount: number;
  lastWindowOpened: number;
  lastWindowClosed: number;
  lastWindowAt: string | null;
  functions: Array<{ fn: string; n: number }>;
  boards: Array<{
    slug: string;
    name: string;
    ats: Ats;
    open_count: number;
    website: string | null;
    logo_url: string | null;
  }>;
  editionAt: string;
};

export async function homeDigest(): Promise<HomeDigest> {
  const sql = await getSql();
  const [stats] = await sql.query<{
    openCount: number;
    companyCount: number;
    lastOkAt: unknown;
    closedCount: number;
    freshCount: number;
  }>(
    `select
      (select count(*)::int from jobs where status = 'open' and us_eligible and tech_eligible) as "openCount",
      (select count(*)::int from companies where enabled) as "companyCount",
      (select max(last_ok_at) from companies) as "lastOkAt",
      (select count(*)::int from jobs where status = 'closed') as "closedCount",
      (select count(*)::int from jobs
        where status = 'open' and us_eligible and tech_eligible
          and first_seen_at >= now() - interval '1 day') as "freshCount"`,
  );
  const [windowRow] = await sql.query<{
    jobs_opened: number;
    jobs_closed: number;
    finished_at: unknown;
  }>(
    `select coalesce(jobs_opened, 0)::int as jobs_opened,
            coalesce(jobs_closed, 0)::int as jobs_closed,
            finished_at
     from crawl_runs
     where finished_at is not null
     order by finished_at desc
     limit 1`,
  );
  const functions = await sql.query<{ fn: string; n: number }>(
    `select coalesce(nullif(function, ''), 'engineering') as fn, count(*)::int as n
     from jobs
     where status = 'open' and us_eligible and tech_eligible
     group by 1
     order by n desc, fn asc`,
  );
  const boards = await sql.query<{
    slug: string;
    name: string;
    ats: Ats;
    open_count: number;
    website: string | null;
    logo_url: string | null;
  }>(
    `select c.slug, c.name, c.ats, c.website, c.logo_url,
            count(j.id) filter (
              where j.status = 'open' and j.us_eligible and j.tech_eligible
            )::int as open_count
     from companies c
     left join jobs j on j.company_id = c.id
     where c.enabled = true
     group by c.id
     order by open_count desc, c.name asc
     limit 12`,
  );
  return {
    openCount: stats?.openCount ?? 0,
    companyCount: stats?.companyCount ?? 0,
    lastOkAt: iso(stats?.lastOkAt),
    closedCount: stats?.closedCount ?? 0,
    freshCount: stats?.freshCount ?? 0,
    lastWindowOpened: windowRow?.jobs_opened ?? 0,
    lastWindowClosed: windowRow?.jobs_closed ?? 0,
    lastWindowAt: iso(windowRow?.finished_at),
    functions,
    boards,
    editionAt: new Date().toISOString(),
  };
}
