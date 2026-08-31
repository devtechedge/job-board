import type { BoardAdapter, RawJob } from "@/lib/ats/types";
import { fetchJson, paceHost } from "@/lib/ats/fetch";
import { greenhouseDetailUrl, greenhouseListUrl } from "@/lib/ats/urls";
import { htmlToText } from "@/lib/sanitize";

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

function toRaw(job: GhJob): RawJob {
  const loc = locationName(job);
  const html = job.content ?? null;
  const department =
    job.departments?.[0]?.name ??
    metaValue(job, "Career Page Allocation") ??
    metaValue(job, "Skillset");
  return {
    sourceId: String(job.id),
    title: job.title?.trim() || "Untitled role",
    applyUrl: job.absolute_url ?? "",
    locationRaw: loc,
    locations: loc ? [loc] : [],
    department,
    descriptionHtml: html,
    descriptionText: html ? htmlToText(html) : null,
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
