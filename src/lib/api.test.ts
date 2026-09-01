import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CORS_HEADERS,
  jsonError,
  jsonOk,
  optionsOk,
  parseCompanySlug,
  parseJobId,
  parseJobsRequest,
  publicCompany,
  publicHome,
  publicJob,
} from "./api.ts";
import { jobQueryFromSearchParams } from "./query.ts";
import type { HomeDigest, JobListItem } from "./search.ts";

const sampleJob: JobListItem = {
  id: "11111111-1111-4111-8111-111111111111",
  company_id: "22222222-2222-4222-8222-222222222222",
  source_ats: "greenhouse",
  source_id: "99",
  title: "Staff Backend Engineer",
  slug: "staff-backend-engineer",
  apply_url: "https://boards.greenhouse.io/acme/jobs/99",
  location_raw: "Remote, United States",
  locations: ["Remote"],
  workplace: "remote",
  salary_min_cents: 18_000_000,
  salary_max_cents: 22_000_000,
  salary_currency: "USD",
  salary_source: "posted",
  yoe_min: 6,
  function: "backend",
  seniority: "staff",
  skills: ["Go", "Postgres"],
  description_html: "<p>Build the register. Pay &mdash; $180k. &lt;script&gt;alert(1)&lt;/script&gt;</p>",
  description_text: "Build the register.",
  summary: "Build the register.",
  posted_at: "2026-08-01T00:00:00.000Z",
  first_seen_at: "2026-08-02T00:00:00.000Z",
  last_seen_at: "2026-09-01T00:00:00.000Z",
  closed_at: null,
  status: "open",
  us_eligible: true,
  tech_eligible: true,
  company_name: "Acme",
  company_slug: "acme",
  company_website: "https://acme.com",
  company_logo_url: null,
};

describe("job query from the public API querystring", () => {
  it("accepts JobQuery fields and drops junk", () => {
    const query = jobQueryFromSearchParams(
      new URLSearchParams({
        q: "postgres",
        fn: "backend",
        seniority: "staff",
        workplace: "remote",
        location: "NYC",
        salaryMin: "180000",
        posted: "7d",
        ats: "greenhouse",
        company: "acme",
        sort: "salary",
        page: "2",
        extra: "nope",
      }),
    );
    assert.equal(query.q, "postgres");
    assert.equal(query.fn, "backend");
    assert.equal(query.seniority, "staff");
    assert.equal(query.workplace, "remote");
    assert.equal(query.location, "NYC");
    assert.equal(query.salaryMin, 180000);
    assert.equal(query.posted, "7d");
    assert.equal(query.ats, "greenhouse");
    assert.equal(query.company, "acme");
    assert.equal(query.sort, "salary");
    assert.equal(query.page, 2);
  });

  it("parses a Request URL", () => {
    const request = new Request("https://jobrow.example/api/jobs?fn=ml&page=3");
    const query = parseJobsRequest(request);
    assert.equal(query.fn, "ml");
    assert.equal(query.page, 3);
    assert.equal(query.sort, "last_seen");
  });
});

describe("public job payload", () => {
  it("omits posting HTML on the list contract", () => {
    const row = publicJob(sampleJob, "list");
    assert.equal(row.title, "Staff Backend Engineer");
    assert.equal(row.company.slug, "acme");
    assert.equal(row.company.logo_url?.includes("acme.com"), true);
    assert.equal("description_html" in row, false);
    assert.equal("description_text" in row, false);
    assert.match(row.salary_label, /\$180k/);
  });

  it("returns sanitized HTML and text on detail", () => {
    const row = publicJob(sampleJob, "detail");
    assert.ok(row.description_html);
    assert.match(row.description_html ?? "", /<p>/);
    assert.match(row.description_html ?? "", /\u2014/);
    assert.equal((row.description_html ?? "").includes("<script>"), false);
    assert.equal((row.description_html ?? "").includes("alert(1)"), false);
    assert.match(row.description_text ?? "", /Build the register/);
  });
});

describe("public company payload", () => {
  it("does not leak crawl errors or board tokens", () => {
    const row = publicCompany({
      id: "1",
      slug: "acme",
      name: "Acme",
      ats: "greenhouse",
      careers_url: "https://boards.greenhouse.io/acme",
      website: "https://acme.com",
      logo_url: null,
      hq_country: "US",
      last_ok_at: new Date("2026-09-01T12:00:00Z"),
      last_error: "https://evil.internal/secret",
      board_token: "super-secret",
      enabled: true,
      open_count: 12,
      listed_count: 40,
    } as Record<string, unknown>);
    assert.equal(row.slug, "acme");
    assert.equal(row.open_count, 12);
    assert.equal(row.last_ok_at?.startsWith("2026-09-01"), true);
    assert.equal("last_error" in row, false);
    assert.equal("board_token" in row, false);
  });
});

describe("home digest", () => {
  it("keeps KPI fields the register uses", () => {
    const digest: HomeDigest = {
      openCount: 10,
      companyCount: 2,
      lastOkAt: "2026-09-01T00:00:00.000Z",
      closedCount: 1,
      freshCount: 3,
      lastWindowOpened: 4,
      lastWindowClosed: 1,
      lastWindowAt: "2026-09-01T00:00:00.000Z",
      functions: [{ fn: "backend", n: 8 }],
      boards: [
        {
          slug: "acme",
          name: "Acme",
          ats: "greenhouse",
          open_count: 8,
          website: "https://acme.com",
          logo_url: null,
        },
      ],
      editionAt: "2026-09-01T00:00:00.000Z",
    };
    const body = publicHome(digest);
    assert.equal(body.openCount, 10);
    assert.equal(body.boards[0]?.logo_url?.includes("acme.com"), true);
    assert.ok(body.editionLabel);
  });
});

describe("id and slug guards", () => {
  it("accepts a UUID and a kebab slug", () => {
    assert.equal(parseJobId(sampleJob.id), sampleJob.id);
    assert.equal(parseJobId("not-a-uuid"), null);
    assert.equal(parseCompanySlug("acme"), "acme");
    assert.equal(parseCompanySlug("../etc/passwd"), null);
  });
});

describe("JSON responses", () => {
  it("sends CORS on success, errors, and OPTIONS", async () => {
    const ok = jsonOk({ ok: true });
    assert.equal(ok.headers.get("Access-Control-Allow-Origin"), CORS_HEADERS["Access-Control-Allow-Origin"]);
    assert.equal(ok.headers.get("Content-Type"), "application/json; charset=utf-8");
    const err = jsonError("Role not found", 404);
    assert.equal(err.status, 404);
    assert.equal(err.headers.get("Access-Control-Allow-Origin"), "*");
    const body = (await err.json()) as { error: string };
    assert.equal(body.error, "Role not found");
    const opt = optionsOk();
    assert.equal(opt.status, 204);
    assert.equal(opt.headers.get("Access-Control-Allow-Methods"), "GET, OPTIONS");
  });
});
