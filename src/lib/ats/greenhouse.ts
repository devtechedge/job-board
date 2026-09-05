import type { BoardAdapter, RawJob } from "@/lib/ats/types";
import { fetchJson, paceHost } from "@/lib/ats/fetch";
import { greenhouseDetailUrl, greenhouseListUrl } from "@/lib/ats/urls";
import { htmlToText } from "@/lib/sanitize";
import { payFromMetaValue, type SalaryGuess } from "@/lib/salary";

type GhMeta = { name?: string; value?: unknown };
type GhJob = {
  id: number | string;
  title?: string;
  absolute_url?: string;
  location?: { name?: string } | string | null;
  first_published?: string | null;
  updated_at?: string | null;
  content?: string | null;
  departments?: Array<{ name?: string }>;
  metadata?: GhMeta[] | null;
  company_name?: string;
};

const PAY_META_RE =
  /salary|compensation|pay transparency|base pay|pay range|total base pay/i;

function locationName(job: GhJob): string {
  if (typeof job.location === "string") return job.location;
  return job.location?.name ?? "";
}

function metaValue(job: GhJob, name: string): string | null {
  for (const row of job.metadata ?? []) {
    if (row?.name === name && row.value) return String(row.value);
  }
  return null;
}

function payFromMetadata(job: GhJob): SalaryGuess {
  let best: SalaryGuess = { minCents: null, maxCents: null, currency: "USD", source: "none" };
  for (const row of job.metadata ?? []) {
    const name = row?.name ?? "";
    if (!PAY_META_RE.test(name)) continue;
    // Prefer full ranges over single midpoints when both exist.
    const guessed = payFromMetaValue(row.value);
    if (!guessed.minCents && !guessed.maxCents) continue;
    if (guessed.minCents && guessed.maxCents) return { ...guessed, source: "posted" };
    if (!best.minCents && !best.maxCents) best = { ...guessed, source: "posted" };
  }
  return best;
}

function toRaw(job: GhJob): RawJob {
  const loc = locationName(job);
  const html = job.content ?? null;
  const department =
    job.departments?.[0]?.name ??
    metaValue(job, "Career Page Allocation") ??
    metaValue(job, "Skillset");
  const pay = payFromMetadata(job);
  return {
    sourceId: String(job.id),
    title: job.title?.trim() || "Untitled role",
    applyUrl: job.absolute_url ?? "",
    locationRaw: loc,
    locations: loc ? [loc] : [],
    department,
    descriptionHtml: html,
    descriptionText: html ? htmlToText(html) : null,
    salaryMinCents: pay.minCents,
    salaryMaxCents: pay.maxCents,
    salaryCurrency: pay.currency,
    salarySource: pay.source,
    postedAt: job.first_published ?? job.updated_at ?? null,
    raw: {
      id: job.id,
      title: job.title,
      absolute_url: job.absolute_url,
      location: loc,
      first_published: job.first_published,
      department,
    },
  };
}

export const greenhouseAdapter: BoardAdapter = {
  name: "greenhouse",
  listUrl: greenhouseListUrl,
  async list(token: string) {
    const url = greenhouseListUrl(token);
    await paceHost(url);
    const result = await fetchJson<{ jobs?: GhJob[] }>(url);
    if (!result.ok) {
      throw new Error(`Greenhouse ${token} HTTP ${result.status}: ${result.body}`);
    }
    return (result.data.jobs ?? []).map(toRaw);
  },
  async detail(token: string, sourceId: string) {
    const url = greenhouseDetailUrl(token, sourceId);
    await paceHost(url, 350);
    const result = await fetchJson<GhJob>(url);
    if (!result.ok) return null;
    return toRaw(result.data);
  },
};
