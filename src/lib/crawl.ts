import { getAdapter } from "@/lib/ats";
import type { Ats, CompanyRow, RawJob } from "@/lib/ats/types";
import { getSql, type Sql } from "@/lib/db";
import { isTechRole } from "@/lib/classify";
import { missingSourceIds, normalizeJob } from "@/lib/normalize";
import { SEED_COMPANIES, STARTER_SLUGS } from "@/lib/seed-companies";
import { iso } from "@/lib/utils";

export type CrawlCompanyResult = {
  slug: string;
  name: string;
  ok: boolean;
  listed: number;
  upserted: number;
  opened: number;
  closed: number;
  error?: string;
};

export type CrawlRunResult = {
  id: string;
  companiesOk: number;
  companiesFail: number;
  jobsUpserted: number;
  jobsClosed: number;
  jobsOpened: number;
  results: CrawlCompanyResult[];
  errorSample: string | null;
};

function newId(): string {
  return crypto.randomUUID();
}

function asCompany(row: Record<string, unknown>): CompanyRow {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    ats: row.ats as Ats,
    board_token: String(row.board_token),
    careers_url: row.careers_url ? String(row.careers_url) : null,
    website: row.website ? String(row.website) : null,
    logo_url: row.logo_url ? String(row.logo_url) : null,
    hq_country: String(row.hq_country ?? "US"),
    enabled: Boolean(row.enabled),
    last_crawled_at: iso(row.last_crawled_at),
    last_ok_at: iso(row.last_ok_at),
    last_error: row.last_error ? String(row.last_error) : null,
  };
}

export async function seedCompanies(sql: Sql): Promise<number> {
  let inserted = 0;
  for (const company of SEED_COMPANIES) {
    const rows = await sql.query<{ id: string }>(
      `insert into companies (id, slug, name, ats, board_token, careers_url, website, hq_country, enabled)
       values ($1,$2,$3,$4,$5,$6,$7,'US', true)
       on conflict (slug) do nothing
       returning id`,
      [
        newId(),
        company.slug,
        company.name,
        company.ats,
        company.boardToken,
        company.careersUrl,
        company.website,
      ],
    );
    inserted += rows.length;
  }
  return inserted;
}

async function mapPool<T, R>(items: T[], n: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const i = cursor;
      cursor += 1;
      out[i] = await fn(items[i]);
    }
  }
  const workers = Array.from({ length: Math.min(n, items.length) }, () => worker());
  await Promise.all(workers);
  return out;
}

async function upsertJob(
  sql: Sql,
  company: CompanyRow,
  raw: RawJob,
  now: string,
): Promise<"opened" | "updated" | "skipped"> {
  const norm = normalizeJob(raw, company);
  if (!norm || !norm.usEligible || !norm.techEligible) return "skipped";
  const existing = await sql.query<{ id: string; first_seen_at: unknown }>(
    `select id, first_seen_at from jobs where source_ats = $1 and source_id = $2`,
    [company.ats, norm.sourceId],
  );
  if (existing[0]) {
    await sql.query(
      `update jobs set
        title = $1, slug = $2, apply_url = $3, location_raw = $4, locations = $5,
        workplace = $6, salary_min_cents = $7, salary_max_cents = $8, salary_currency = $9,
        salary_source = $10, yoe_min = $11, function = $12, seniority = $13, skills = $14,
        description_html = coalesce(nullif($15, ''), description_html),
        description_text = coalesce(nullif($16, ''), description_text),
        summary = $17, posted_at = coalesce($18::timestamptz, posted_at),
        last_seen_at = $19::timestamptz, closed_at = null, status = 'open',
        us_eligible = $20, tech_eligible = $21, raw_json = $22, search_text = $23
       where id = $24`,
      [
        norm.title,
        norm.slug,
        norm.applyUrl,
        norm.locationRaw,
        norm.locations,
        norm.workplace,
        norm.salaryMinCents,
        norm.salaryMaxCents,
        norm.salaryCurrency,
        norm.salarySource,
        norm.yoeMin,
        norm.function,
        norm.seniority,
        norm.skills,
        norm.descriptionHtml,
        norm.descriptionText,
        norm.summary,
        norm.postedAt,
        now,
        norm.usEligible,
        norm.techEligible,
        norm.rawJson,
        norm.searchText,
        existing[0].id,
      ],
    );
    return "updated";
  }
  await sql.query(
    `insert into jobs (
      id, company_id, source_ats, source_id, title, slug, apply_url, location_raw, locations,
      workplace, salary_min_cents, salary_max_cents, salary_currency, salary_source, yoe_min,
      function, seniority, skills, description_html, description_text, summary, posted_at,
      first_seen_at, last_seen_at, status, us_eligible, tech_eligible, raw_json, search_text
    ) values (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,
      $10,$11,$12,$13,$14,$15,
      $16,$17,$18,$19,$20,$21,$22::timestamptz,
      $23::timestamptz,$24::timestamptz,'open',$25,$26,$27,$28
    )`,
    [
      newId(),
      company.id,
      company.ats,
      norm.sourceId,
      norm.title,
      norm.slug,
      norm.applyUrl,
      norm.locationRaw,
      norm.locations,
      norm.workplace,
      norm.salaryMinCents,
      norm.salaryMaxCents,
      norm.salaryCurrency,
      norm.salarySource,
      norm.yoeMin,
      norm.function,
      norm.seniority,
      norm.skills,
      norm.descriptionHtml,
      norm.descriptionText,
      norm.summary,
      norm.postedAt,
      now,
      now,
      norm.usEligible,
      norm.techEligible,
      norm.rawJson,
      norm.searchText,
    ],
  );
  return "opened";
}

export async function crawlCompany(sql: Sql, company: CompanyRow): Promise<CrawlCompanyResult> {
  const now = new Date().toISOString();
  await sql.query(
    `update companies set last_crawled_at = $1::timestamptz, updated_at = $1::timestamptz where id = $2`,
    [now, company.id],
  );
  try {
    const adapter = getAdapter(company.ats);
    const listed = await adapter.list(company.board_token);
    const listedIds = listed.map((job) => job.sourceId).filter(Boolean);
    let upserted = 0;
    let opened = 0;
    for (const raw of listed) {
      const action = await upsertJob(sql, company, raw, now);
      if (action === "skipped") continue;
      upserted += 1;
      if (action === "opened") opened += 1;
    }
    const openRows = await sql.query<{ source_id: string }>(
      `select source_id from jobs where company_id = $1 and status = 'open'`,
      [company.id],
    );
    const toClose = missingSourceIds(
      openRows.map((row) => row.source_id),
      listedIds,
    );
    let closed = 0;
    if (toClose.length) {
      const closedRows = await sql.query<{ id: string }>(
        `update jobs set status = 'closed', closed_at = $1::timestamptz
         where company_id = $2 and status = 'open' and source_id = any($3::text[])
         returning id`,
        [now, company.id, toClose],
      );
      closed = closedRows.length;
    }
    await sql.query(
      `update companies set last_ok_at = $1::timestamptz, last_error = null, updated_at = $1::timestamptz where id = $2`,
      [now, company.id],
    );
    return {
      slug: company.slug,
      name: company.name,
      ok: true,
      listed: listed.length,
      upserted,
      opened,
      closed,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : "crawl failed";
    await sql.query(
      `update companies set last_error = $1, updated_at = now() where id = $2`,
      [message, company.id],
    );
    return {
      slug: company.slug,
      name: company.name,
      ok: false,
      listed: 0,
      upserted: 0,
      opened: 0,
      closed: 0,
      error: message,
    };
  }
}

export async function crawlCompanies(
  companies: CompanyRow[],
  opts: { shard?: number; shardOf?: number } = {},
): Promise<CrawlRunResult> {
  const sql = await getSql();
  const runId = newId();
  await sql.query(
    `insert into crawl_runs (id, shard, shard_of) values ($1,$2,$3)`,
    [runId, opts.shard ?? null, opts.shardOf ?? null],
  );
  const results = await mapPool(companies, 2, (company) => crawlCompany(sql, company));
  const summary: CrawlRunResult = {
    id: runId,
    companiesOk: results.filter((row) => row.ok).length,
    companiesFail: results.filter((row) => !row.ok).length,
    jobsUpserted: results.reduce((n, row) => n + row.upserted, 0),
    jobsClosed: results.reduce((n, row) => n + row.closed, 0),
    jobsOpened: results.reduce((n, row) => n + row.opened, 0),
    results,
    errorSample: results.find((row) => row.error)?.error ?? null,
  };
  await sql.query(
    `update crawl_runs set finished_at = now(), companies_ok = $1, companies_fail = $2,
      jobs_upserted = $3, jobs_closed = $4, jobs_opened = $5, error_sample = $6
     where id = $7`,
    [
      summary.companiesOk,
      summary.companiesFail,
      summary.jobsUpserted,
      summary.jobsClosed,
      summary.jobsOpened,
      summary.errorSample,
      runId,
    ],
  );
  return summary;
}

export async function reclassifyOpenJobs(sql: Sql): Promise<number> {
  const rows = await sql.query<{ id: string; title: string; tech_eligible: boolean }>(
    `select id, title, tech_eligible from jobs where status = 'open'`,
  );
  const drop = rows.filter((row) => row.tech_eligible && !isTechRole(row.title)).map((row) => row.id);
  const keep = rows.filter((row) => isTechRole(row.title) && !row.tech_eligible).map((row) => row.id);
  if (drop.length) {
    await sql.query(`update jobs set tech_eligible = false where id = any($1::text[])`, [drop]);
  }
  if (keep.length) {
    await sql.query(`update jobs set tech_eligible = true where id = any($1::text[])`, [keep]);
  }
  return drop.length + keep.length;
}

export async function loadEnabledCompanies(): Promise<CompanyRow[]> {
  const sql = await getSql();
  const rows = await sql.query<Record<string, unknown>>(
    `select * from companies where enabled = true order by name asc`,
  );
  return rows.map(asCompany);
}

export async function crawlShard(shard: number, of: number): Promise<CrawlRunResult> {
  const all = await loadEnabledCompanies();
  const slice = all.filter((_, i) => i % of === shard);
  return crawlCompanies(slice, { shard, shardOf: of });
}

export async function crawlOne(slugOrId: string): Promise<CrawlCompanyResult> {
  const sql = await getSql();
  const rows = await sql.query<Record<string, unknown>>(
    `select * from companies where slug = $1 or id = $1 limit 1`,
    [slugOrId],
  );
  if (!rows[0]) {
    return {
      slug: slugOrId,
      name: slugOrId,
      ok: false,
      listed: 0,
      upserted: 0,
      opened: 0,
      closed: 0,
      error: "company not found",
    };
  }
  return crawlCompany(sql, asCompany(rows[0]));
}

const bootRef = globalThis as typeof globalThis & {
  __jobrowBoot__?: Promise<void>;
};

export async function ensureIndex(): Promise<{ companies: number; jobs: number; indexing: boolean }> {
  const sql = await getSql();
  await seedCompanies(sql);
  await reclassifyOpenJobs(sql).catch(() => 0);
  const [{ companies }] = await sql.query<{ companies: number }>(
    `select count(*)::int as companies from companies`,
  );
  const [{ jobs }] = await sql.query<{ jobs: number }>(
    `select count(*)::int as jobs from jobs where status = 'open'`,
  );

  if (jobs === 0) {
    bootRef.__jobrowBoot__ ??= (async () => {
      const rows = await sql.query<Record<string, unknown>>(
        `select * from companies where slug = any($1::text[]) and enabled = true`,
        [STARTER_SLUGS],
      );
      await crawlCompanies(rows.map(asCompany), { shard: 0, shardOf: 1 });
    })();
    await bootRef.__jobrowBoot__;
  }

  // Vercel Hobby freezes the isolate when the response is sent. Do remaining
  // boards in this request with a tight budget, GH first, never-tried first.
  const budgetMs = jobs === 0 ? 2_500 : 6_500;
  const pending = await crawlPendingSlice(budgetMs);
  const [{ jobsAfter }] = await sql.query<{ jobsAfter: number }>(
    `select count(*)::int as "jobsAfter" from jobs where status = 'open'`,
  );
  return { companies, jobs: jobsAfter, indexing: pending > 0 };
}

async function crawlPendingSlice(budgetMs: number): Promise<number> {
  const sql = await getSql();
  const rows = await sql.query<Record<string, unknown>>(
    `select * from companies
     where enabled = true and last_ok_at is null
     order by case when last_crawled_at is null then 0 else 1 end,
              case ats
                when 'greenhouse' then 0
                when 'workable' then 1
                when 'lever' then 2
                else 3
              end,
              name asc`,
  );
  const start = Date.now();
  let crawled = 0;
  for (const row of rows) {
    if (Date.now() - start > budgetMs) break;
    await crawlCompany(sql, asCompany(row));
    crawled += 1;
    if (crawled >= 2) break;
  }
  const [{ pending }] = await sql.query<{ pending: number }>(
    `select count(*)::int as pending from companies where enabled = true and last_ok_at is null`,
  );
  return pending;
}

export async function fillJobDescription(jobId: string): Promise<void> {
  const sql = await getSql();
  const rows = await sql.query<{
    id: string;
    source_id: string;
    description_html: string | null;
    ats: Ats;
    board_token: string;
    company_id: string;
  }>(
    `select j.id, j.source_id, j.description_html, c.ats, c.board_token, j.company_id
     from jobs j join companies c on c.id = j.company_id
     where j.id = $1`,
    [jobId],
  );
  const job = rows[0];
  if (!job || job.description_html) return;
  const adapter = getAdapter(job.ats);
  if (!adapter.detail) return;
  const detailed = await adapter.detail(job.board_token, job.source_id);
  if (!detailed?.descriptionHtml) return;
  const companyRows = await sql.query<Record<string, unknown>>(
    `select * from companies where id = $1`,
    [job.company_id],
  );
  if (!companyRows[0]) return;
  const norm = normalizeJob(detailed, asCompany(companyRows[0]));
  if (!norm) return;
  await sql.query(
    `update jobs set description_html = $1, description_text = $2, summary = $3, search_text = $4,
      skills = $5, salary_min_cents = coalesce(salary_min_cents, $6),
      salary_max_cents = coalesce(salary_max_cents, $7),
      salary_source = case when salary_source = 'none' then $8 else salary_source end
     where id = $9`,
    [
      norm.descriptionHtml,
      norm.descriptionText,
      norm.summary,
      norm.searchText,
      norm.skills,
      norm.salaryMinCents,
      norm.salaryMaxCents,
      norm.salarySource,
      job.id,
    ],
  );
}
