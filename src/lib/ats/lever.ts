import type { BoardAdapter, RawJob } from "@/lib/ats/types";
import { fetchJson, paceHost } from "@/lib/ats/fetch";
import { leverListUrl } from "@/lib/ats/urls";
import { htmlToText } from "@/lib/sanitize";

type LeverJob = {
  id?: string;
  text?: string;
  categories?: {
    commitment?: string;
    department?: string;
    location?: string;
    team?: string;
    allLocations?: string[];
  };
  country?: string;
  workplaceType?: string;
  description?: string;
  descriptionPlain?: string;
  descriptionBody?: string;
  hostedUrl?: string;
  applyUrl?: string;
  createdAt?: number | string;
};

function toRaw(job: LeverJob): RawJob {
  const locations = [
    job.categories?.location,
    ...(job.categories?.allLocations ?? []),
  ].filter((item, i, arr): item is string => Boolean(item) && arr.indexOf(item) === i);
  const html = job.descriptionBody || job.description || null;
  const posted =
    typeof job.createdAt === "number"
      ? new Date(job.createdAt).toISOString()
      : (job.createdAt ?? null);
  return {
    sourceId: String(job.id ?? ""),
    title: job.text?.trim() || "Untitled role",
    applyUrl: job.applyUrl || job.hostedUrl || "",
    jobUrl: job.hostedUrl,
    locationRaw: locations.join(" · "),
    locations,
    workplaceHint: job.workplaceType ?? null,
    department: job.categories?.department || job.categories?.team || null,
    team: job.categories?.team ?? null,
    descriptionHtml: html,
    descriptionText: job.descriptionPlain || (html ? htmlToText(html) : null),
    postedAt: posted,
    country: job.country ?? null,
    raw: {
      id: job.id,
      text: job.text,
      hostedUrl: job.hostedUrl,
      applyUrl: job.applyUrl,
      categories: job.categories,
      workplaceType: job.workplaceType,
      country: job.country,
      createdAt: job.createdAt,
    },
  };
}

export const leverAdapter: BoardAdapter = {
  name: "lever",
  listUrl: leverListUrl,
  async list(token: string) {
    const url = leverListUrl(token);
    await paceHost(url);
    const result = await fetchJson<LeverJob[]>(url);
    if (!result.ok) {
      throw new Error(`Lever ${token} HTTP ${result.status}: ${result.body}`);
    }
    const jobs = Array.isArray(result.data) ? result.data : [];
    return jobs.map((job) => {
      job.description = undefined;
      job.descriptionBody = undefined;
      if (job.descriptionPlain && job.descriptionPlain.length > 2500) {
        job.descriptionPlain = job.descriptionPlain.slice(0, 2500);
      }
      return toRaw(job);
    });
  },
};
