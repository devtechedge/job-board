import type { BoardAdapter, RawJob } from "@/lib/ats/types";
import { fetchJson, paceHost } from "@/lib/ats/fetch";
import { workableListUrl } from "@/lib/ats/urls";

type WorkableJob = {
  id?: string | number;
  title?: string;
  url?: string;
  shortlink?: string;
  location?: string | { city?: string; country?: string; telecommuting?: boolean };
  department?: string;
  created_at?: string;
  published_on?: string;
};

export const workableAdapter: BoardAdapter = {
  name: "workable",
  listUrl: workableListUrl,
  async list(token: string) {
    const url = workableListUrl(token);
    await paceHost(url);
    const result = await fetchJson<{ jobs?: WorkableJob[] }>(url);
    if (!result.ok) {
      throw new Error(`Workable ${token} HTTP ${result.status}: ${result.body}`);
    }
    return (result.data.jobs ?? []).map((job) => {
      const loc =
        typeof job.location === "string"
          ? job.location
          : [job.location?.city, job.location?.country].filter(Boolean).join(", ");
      const applyUrl = job.url || job.shortlink || "";
      return {
        sourceId: String(job.id ?? applyUrl),
        title: job.title?.trim() || "Untitled role",
        applyUrl,
        locationRaw: loc,
        locations: loc ? [loc] : [],
        workplaceHint:
          typeof job.location === "object" && job.location?.telecommuting ? "remote" : null,
        department: job.department ?? null,
        postedAt: job.published_on ?? job.created_at ?? null,
        raw: { id: job.id, title: job.title, url: applyUrl, location: loc },
      } satisfies RawJob;
    });
  },
};

export const stubAdapter = (name: "rippling" | "gem"): BoardAdapter => ({
  name,
  listUrl: () => "",
  async list() {
    throw new Error(`${name} public JSON adapter is not wired in v1`);
  },
});
