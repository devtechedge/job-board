import type { CompanyRow, RawJob, Workplace } from "@/lib/ats/types";
import { canonicalizeApplyUrl, isAllowedApplyUrl } from "@/lib/ats/apply-url";
import {
  classifyFunction,
  classifySeniority,
  extractSkills,
  isTechRole,
  isUsEligible,
  parseWorkplace,
  parseYoe,
} from "@/lib/classify";
import { parseSalaryFromText } from "@/lib/salary";
import { firstSentence, htmlToText, sanitizeHtml } from "@/lib/sanitize";
import { slugify } from "@/lib/utils";
import { missingSourceIds } from "@/lib/close";

export type NormalizedJob = {
  sourceId: string;
  title: string;
  slug: string;
  applyUrl: string;
  locationRaw: string;
  locations: string[];
  workplace: Workplace;
  salaryMinCents: number | null;
  salaryMaxCents: number | null;
  salaryCurrency: string;
  salarySource: "posted" | "inferred" | "none";
  yoeMin: number | null;
  function: string | null;
  seniority: string | null;
  skills: string[];
  descriptionHtml: string;
  descriptionText: string;
  summary: string;
  postedAt: string | null;
  usEligible: boolean;
  techEligible: boolean;
  searchText: string;
  rawJson: string;
};

export function normalizeJob(raw: RawJob, company: CompanyRow): NormalizedJob | null {
  if (!raw.sourceId || !raw.title) return null;
  const applyUrl = canonicalizeApplyUrl(raw.applyUrl);
  if (!isAllowedApplyUrl(applyUrl, [company.website, company.careers_url])) {
    return null;
  }
  const locationRaw = raw.locationRaw || raw.locations.join(" · ");
  const workplace = parseWorkplace(locationRaw, raw.workplaceHint, raw.isRemote ?? null);
  const text = (raw.descriptionText || htmlToText(raw.descriptionHtml) || "").slice(0, 20_000);
  const html = sanitizeHtml(raw.descriptionHtml);
  const techEligible = isTechRole(raw.title, raw.department);
  const usEligible = isUsEligible({
    locationRaw,
    locations: raw.locations,
    workplace,
    country: raw.country,
    hqCountry: company.hq_country,
  });
  let salaryMin = raw.salaryMinCents ?? null;
  let salaryMax = raw.salaryMaxCents ?? null;
  let salarySource = raw.salarySource ?? "none";
  let salaryCurrency = raw.salaryCurrency ?? "USD";
  if (!salaryMin && !salaryMax) {
    const guessed = parseSalaryFromText(`${raw.title} ${text}`.slice(0, 4000));
    salaryMin = guessed.minCents;
    salaryMax = guessed.maxCents;
    salarySource = guessed.source;
    salaryCurrency = guessed.currency;
  }
  const skills = extractSkills(`${raw.title} ${raw.department ?? ""} ${text}`);
  const summary = firstSentence(text) || `${raw.title} at ${company.name}.`;
  const searchText = [
    raw.title,
    company.name,
    locationRaw,
    raw.department,
    skills.join(" "),
    summary,
    text.slice(0, 1500),
  ]
    .filter(Boolean)
    .join(" \n ");
  return {
    sourceId: raw.sourceId,
    title: raw.title.trim(),
    slug: `${slugify(raw.title)}-${raw.sourceId}`.slice(0, 120),
    applyUrl,
    locationRaw,
    locations: raw.locations.length ? raw.locations : locationRaw ? [locationRaw] : [],
    workplace,
    salaryMinCents: salaryMin,
    salaryMaxCents: salaryMax,
    salaryCurrency,
    salarySource,
    yoeMin: parseYoe(text),
    function: classifyFunction(raw.title, raw.department),
    seniority: classifySeniority(raw.title),
    skills,
    descriptionHtml: html,
    descriptionText: text,
    summary,
    postedAt: raw.postedAt ?? null,
    usEligible,
    techEligible,
    searchText,
    rawJson: JSON.stringify(raw.raw).slice(0, 4000),
  };
}

export { missingSourceIds };

