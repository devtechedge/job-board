export const FUNCTIONS = [
  "backend",
  "frontend",
  "fullstack",
  "mobile",
  "data",
  "ml",
  "design",
  "product",
  "security",
  "infra",
  "research",
  "engineering",
] as const;

export const SENIORITIES = [
  "intern",
  "junior",
  "mid",
  "senior",
  "staff",
  "principal",
  "manager",
] as const;

export const WORKPLACES = ["remote", "hybrid", "onsite"] as const;
export const ATS_FILTERS = ["greenhouse", "ashby", "lever"] as const;
export const POSTED_WINDOWS = ["1d", "3d", "7d", "14d", "30d"] as const;
export const SORTS = ["posted", "first_seen", "last_seen", "salary", "title"] as const;

export type JobQuery = {
  q: string;
  fn: string;
  seniority: string;
  workplace: string;
  location: string;
  salaryMin: number | null;
  posted: string;
  ats: string;
  company: string;
  sort: (typeof SORTS)[number];
  page: number;
};

export const DEFAULT_QUERY: JobQuery = {
  q: "",
  fn: "",
  seniority: "",
  workplace: "",
  location: "",
  salaryMin: null,
  posted: "",
  ats: "",
  company: "",
  sort: "posted",
  page: 1,
};

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function parseJobQuery(raw: Record<string, unknown> | undefined): JobQuery {
  const s = raw ?? {};
  const sortRaw = str(s.sort);
  const sort = (SORTS as readonly string[]).includes(sortRaw)
    ? (sortRaw as JobQuery["sort"])
    : "posted";
  const salaryRaw = s.salaryMin;
  const salaryMin =
    typeof salaryRaw === "number"
      ? salaryRaw
      : typeof salaryRaw === "string" && salaryRaw
        ? Number(salaryRaw)
        : null;
  const pageRaw = s.page;
  const page =
    typeof pageRaw === "number"
      ? pageRaw
      : typeof pageRaw === "string" && pageRaw
        ? Number(pageRaw)
        : 1;
  const fn = str(s.fn);
  const seniority = str(s.seniority);
  const workplace = str(s.workplace);
  const ats = str(s.ats);
  const company = str(s.company).toLowerCase();
  return {
    q: str(s.q).slice(0, 120),
    fn: (FUNCTIONS as readonly string[]).includes(fn) ? fn : "",
    seniority: (SENIORITIES as readonly string[]).includes(seniority) ? seniority : "",
    workplace: (WORKPLACES as readonly string[]).includes(workplace) ? workplace : "",
    location: str(s.location).slice(0, 80),
    salaryMin: salaryMin && Number.isFinite(salaryMin) ? Math.min(Math.max(salaryMin, 0), 1_000_000) : null,
    posted: (POSTED_WINDOWS as readonly string[]).includes(str(s.posted)) ? str(s.posted) : "",
    ats: (ATS_FILTERS as readonly string[]).includes(ats) ? ats : "",
    company: /^[a-z0-9-]{1,80}$/.test(company) ? company : "",
    sort,
    page: Number.isFinite(page) && page > 0 ? Math.min(Math.floor(page), 100) : 1,
  };
}

export type JobSearch = {
  q?: string;
  fn?: string;
  seniority?: string;
  workplace?: string;
  location?: string;
  salaryMin?: number;
  posted?: string;
  ats?: string;
  company?: string;
  sort?: (typeof SORTS)[number];
  page?: number;
};

export function compactSearch(query: JobQuery): JobSearch {
  const out: JobSearch = {};
  if (query.q) out.q = query.q;
  if (query.fn) out.fn = query.fn;
  if (query.seniority) out.seniority = query.seniority;
  if (query.workplace) out.workplace = query.workplace;
  if (query.location) out.location = query.location;
  if (query.salaryMin) out.salaryMin = query.salaryMin;
  if (query.posted) out.posted = query.posted;
  if (query.ats) out.ats = query.ats;
  if (query.company) out.company = query.company;
  if (query.sort && query.sort !== "posted") out.sort = query.sort;
  if (query.page > 1) out.page = query.page;
  return out;
}

export function asJobSearch(raw: Record<string, unknown> | JobSearch | undefined): JobSearch {
  return compactSearch(parseJobQuery(raw as Record<string, unknown>));
}

export function sentenceToFilters(sentence: string): Partial<JobQuery> {
  const s = sentence.toLowerCase();
  const out: Partial<JobQuery> = {};
  if (/\bremote\b/.test(s)) out.workplace = "remote";
  else if (/\bhybrid\b/.test(s)) out.workplace = "hybrid";
  else if (/\bon[- ]?site\b/.test(s)) out.workplace = "onsite";

  if (/\bintern\b/.test(s)) out.seniority = "intern";
  else if (/\bprincipal\b/.test(s)) out.seniority = "principal";
  else if (/\bstaff\b/.test(s)) out.seniority = "staff";
  else if (/\bsenior|sr\b/.test(s)) out.seniority = "senior";
  else if (/\bjunior|jr\b/.test(s)) out.seniority = "junior";

  for (const fn of FUNCTIONS) {
    if (s.includes(fn) || (fn === "ml" && /machine learning|\bai\b/.test(s))) {
      out.fn = fn;
      break;
    }
  }

  const pay = s.match(/(\d{2,3})\s*k/);
  if (pay) out.salaryMin = Number(pay[1]) * 1000;

  if (/\bgreenhouse\b/.test(s)) out.ats = "greenhouse";
  if (/\bashby\b/.test(s)) out.ats = "ashby";
  if (/\blever\b/.test(s)) out.ats = "lever";

  const loc = sentence.match(
    /\b(new york|nyc|san francisco|seattle|austin|boston|chicago|denver|los angeles|remote us)\b/i,
  );
  if (loc) out.location = loc[1];

  const leftover = sentence
    .replace(
      /\b(remote|hybrid|on-?site|intern|principal|staff|senior|sr|junior|jr|backend|frontend|full-?stack|mobile|data|machine learning|\bai\b|\bml\b|design|product|security|infra|research|greenhouse|ashby|lever|\d{2,3}\s*k|new york|nyc|san francisco|seattle|austin|boston|chicago|denver|los angeles|remote us)\b/gi,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
  if (leftover) out.q = leftover.slice(0, 80);
  return out;
}

export const PAGE_SIZE = 40;

export function jobQueryFromSearchParams(params: URLSearchParams): JobQuery {
  const raw: Record<string, unknown> = {};
  for (const [key, value] of params.entries()) {
    raw[key] = value;
  }
  return parseJobQuery(raw);
}
