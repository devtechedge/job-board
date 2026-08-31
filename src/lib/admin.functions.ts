import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const authFields = z.object({
  password: z.string().min(1),
});

export const adminStatusFn = createServerFn({ method: "GET" }).handler(async () => {
  const { expectedAdminPassword, previewAdminFallback } = await import("@/lib/admin");
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const companies = await sql.query<{
    id: string;
    slug: string;
    name: string;
    ats: string;
    board_token: string;
    careers_url: string | null;
    website: string | null;
    enabled: boolean;
    last_crawled_at: unknown;
    last_ok_at: unknown;
    last_error: string | null;
    open_count: number;
  }>(
    `select c.id, c.slug, c.name, c.ats, c.board_token, c.careers_url, c.website, c.enabled,
            c.last_crawled_at, c.last_ok_at, c.last_error,
            count(j.id) filter (where j.status = 'open')::int as open_count
     from companies c
     left join jobs j on j.company_id = c.id
     group by c.id
     order by c.name`,
  );
  const runs = await sql.query<{
    id: string;
    started_at: unknown;
    finished_at: unknown;
    companies_ok: number;
    companies_fail: number;
    jobs_upserted: number;
    jobs_closed: number;
    jobs_opened: number;
    error_sample: string | null;
  }>(`select * from crawl_runs order by started_at desc limit 8`);
  const iso = (value: unknown) =>
    value instanceof Date ? value.toISOString() : value ? String(value) : null;
  return {
    configured: Boolean(expectedAdminPassword()),
    previewHint: previewAdminFallback(),
    companies: companies.map((row) => ({
      ...row,
      last_crawled_at: iso(row.last_crawled_at),
      last_ok_at: iso(row.last_ok_at),
    })),
    runs: runs.map((row) => ({
      ...row,
      started_at: iso(row.started_at),
      finished_at: iso(row.finished_at),
    })),
  };
});

export const adminUnlockFn = createServerFn({ method: "POST" })
  .validator((data) => authFields.parse(data))
  .handler(async ({ data }) => {
    const { adminPasswordOk } = await import("@/lib/admin");
    if (!adminPasswordOk(data.password)) throw new Error("Wrong password");
    return { ok: true };
  });

export const adminCrawlFn = createServerFn({ method: "POST" })
  .validator((data) =>
    authFields
      .extend({
        slug: z.string().optional(),
        all: z.boolean().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { adminPasswordOk } = await import("@/lib/admin");
    if (!adminPasswordOk(data.password)) throw new Error("Wrong password");
    const crawl = await import("@/lib/crawl");
    if (data.slug) return { one: await crawl.crawlOne(data.slug) };
    const companies = await crawl.loadEnabledCompanies();
    return { run: await crawl.crawlCompanies(companies) };
  });

export const adminSaveCompanyFn = createServerFn({ method: "POST" })
  .validator((data) =>
    authFields
      .extend({
        id: z.string().optional(),
        name: z.string().min(1),
        slug: z.string().min(1),
        ats: z.enum(["greenhouse", "ashby", "lever", "workable", "rippling", "gem"]),
        board_token: z.string().min(1),
        careers_url: z.string().optional(),
        website: z.string().optional(),
        enabled: z.boolean().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { adminPasswordOk } = await import("@/lib/admin");
    if (!adminPasswordOk(data.password)) throw new Error("Wrong password");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const slug = data.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (data.id) {
      await sql.query(
        `update companies set name=$1, slug=$2, ats=$3, board_token=$4, careers_url=$5,
          website=$6, enabled=$7, updated_at=now() where id=$8`,
        [
          data.name,
          slug,
          data.ats,
          data.board_token,
          data.careers_url || null,
          data.website || null,
          data.enabled ?? true,
          data.id,
        ],
      );
      return { id: data.id };
    }
    const id = crypto.randomUUID();
    await sql.query(
      `insert into companies (id, slug, name, ats, board_token, careers_url, website, enabled)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        id,
        slug,
        data.name,
        data.ats,
        data.board_token,
        data.careers_url || null,
        data.website || null,
        data.enabled ?? true,
      ],
    );
    return { id };
  });

export const adminDeleteCompanyFn = createServerFn({ method: "POST" })
  .validator((data) => authFields.extend({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const { adminPasswordOk } = await import("@/lib/admin");
    if (!adminPasswordOk(data.password)) throw new Error("Wrong password");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql.query(`delete from companies where id = $1`, [data.id]);
    return { ok: true };
  });
