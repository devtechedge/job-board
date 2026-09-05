import type { BoardAdapter, RawJob, SalarySource } from "@/lib/ats/types";
import { fetchJson, paceHost } from "@/lib/ats/fetch";
import { ashbyListUrl } from "@/lib/ats/urls";
import { dollarsToCents, parseSalaryFromText } from "@/lib/salary";
import { htmlToText } from "@/lib/sanitize";

type AshbyAddress = {
  postalAddress?: {
    addressRegion?: string;
    addressCountry?: string;
    addressLocality?: string;
  };
};

type AshbyComp = {
  compensationTierSummary?: string;
  scrapeableCompensationSalarySummary?: string;
  summaryComponents?: Array<{
    compensationType?: string;
    currencyCode?: string;
    minValue?: number | null;
    maxValue?: number | null;
  }>;
};

type AshbyJob = {
  id?: string;
  title?: string;
  department?: string | { name?: string };
  team?: string | { name?: string };
  employmentType?: string;
  location?: string | { name?: string };
  secondaryLocations?: Array<string | { name?: string }>;
  publishedAt?: string;
  isListed?: boolean;
  isRemote?: boolean | null;
  workplaceType?: string | null;
  address?: AshbyAddress;
  jobUrl?: string;
  applyUrl?: string;
  descriptionHtml?: string;
  descriptionPlain?: string;
  compensation?: AshbyComp | null;
};

function asName(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value && "name" in value) {
    return String((value as { name?: string }).name ?? "");
  }
  return "";
}

function payFrom(comp: AshbyComp | null | undefined): {
  min: number | null;
  max: number | null;
  currency: string;
  source: SalarySource;
} {
  const salary = (comp?.summaryComponents ?? []).find(
    (row) => (row.compensationType ?? "").toLowerCase() === "salary",
  );
  const min = dollarsToCents(salary?.minValue ?? null);
  const max = dollarsToCents(salary?.maxValue ?? null);
  if (min || max) {
    return {
      min,
      max,
      currency: salary?.currencyCode ?? "USD",
      source: "posted",
    };
  }
  // Boards sometimes only expose a human summary string — parse it, still mark posted.
  const summary =
    comp?.scrapeableCompensationSalarySummary ||
    comp?.compensationTierSummary ||
    "";
  if (summary) {
    const guessed = parseSalaryFromText(summary);
    if (guessed.minCents || guessed.maxCents) {
      return {
        min: guessed.minCents,
        max: guessed.maxCents,
        currency: guessed.currency,
        source: "posted",
      };
    }
  }
  return { min: null, max: null, currency: "USD", source: "none" };
}

function toRaw(job: AshbyJob): RawJob {
  const loc = asName(job.location);
  const secondary = (job.secondaryLocations ?? []).map(asName).filter(Boolean);
  const locality = job.address?.postalAddress?.addressLocality;
  const region = job.address?.postalAddress?.addressRegion;
  const country = job.address?.postalAddress?.addressCountry ?? null;
  const locations = [loc, locality, region, country, ...secondary].filter(
    (item, i, arr): item is string => Boolean(item) && arr.indexOf(item) === i,
  );
  const html = job.descriptionHtml ?? null;
  const pay = payFrom(job.compensation);
  return {
    sourceId: String(job.id ?? ""),
    title: job.title?.trim() || "Untitled role",
    applyUrl: job.applyUrl || job.jobUrl || "",
    jobUrl: job.jobUrl,
    locationRaw: locations.join(" · "),
    locations,
    workplaceHint: job.workplaceType ?? null,
    isRemote: job.isRemote ?? null,
    department: asName(job.department) || null,
    team: asName(job.team) || null,
    descriptionHtml: html,
    descriptionText: job.descriptionPlain || (html ? htmlToText(html) : null),
    salaryMinCents: pay.min,
    salaryMaxCents: pay.max,
    salaryCurrency: pay.currency,
    salarySource: pay.source,
    postedAt: job.publishedAt ?? null,
    country,
    raw: {
      id: job.id,
      title: job.title,
      applyUrl: job.applyUrl,
      jobUrl: job.jobUrl,
      location: loc,
      workplaceType: job.workplaceType,
      isRemote: job.isRemote,
      compensation: job.compensation?.scrapeableCompensationSalarySummary ?? null,
    },
  };
}

export const ashbyAdapter: BoardAdapter = {
  name: "ashby",
  listUrl: ashbyListUrl,
  async list(token: string) {
    const url = ashbyListUrl(token);
    await paceHost(url);
    const result = await fetchJson<{ jobs?: AshbyJob[] } | AshbyJob[]>(url);
    if (!result.ok) {
      throw new Error(`Ashby ${token} HTTP ${result.status}: ${result.body}`);
    }
    const jobs = Array.isArray(result.data) ? result.data : (result.data.jobs ?? []);
    return jobs
      .filter((job) => job.isListed !== false)
      .map((job) => {
        job.descriptionHtml = undefined;
        if (job.descriptionPlain && job.descriptionPlain.length > 2500) {
          job.descriptionPlain = job.descriptionPlain.slice(0, 2500);
        }
        return toRaw(job);
      });
  },
};
