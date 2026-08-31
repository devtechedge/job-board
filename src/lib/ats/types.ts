export type Ats =
  | "greenhouse"
  | "ashby"
  | "lever"
  | "workable"
  | "rippling"
  | "gem";

export type Workplace = "remote" | "hybrid" | "onsite" | "unknown";
export type SalarySource = "posted" | "inferred" | "none";
export type JobStatus = "open" | "closed";

export type RawJob = {
  sourceId: string;
  title: string;
  applyUrl: string;
  jobUrl?: string;
  locationRaw: string;
  locations: string[];
  workplaceHint?: string | null;
  isRemote?: boolean | null;
  department?: string | null;
  team?: string | null;
  descriptionHtml?: string | null;
  descriptionText?: string | null;
  salaryMinCents?: number | null;
  salaryMaxCents?: number | null;
  salaryCurrency?: string | null;
  salarySource?: SalarySource;
  postedAt?: string | null;
  country?: string | null;
  raw: Record<string, unknown>;
};

export type BoardAdapter = {
  name: Ats;
  listUrl: (token: string) => string;
  list: (token: string) => Promise<RawJob[]>;
  detail?: (token: string, sourceId: string) => Promise<RawJob | null>;
};

export type CompanyRow = {
  id: string;
  slug: string;
  name: string;
  ats: Ats;
  board_token: string;
  careers_url: string | null;
  website: string | null;
  logo_url: string | null;
  hq_country: string;
  enabled: boolean;
  last_crawled_at: string | null;
  last_ok_at: string | null;
  last_error: string | null;
};

export type JobRow = {
  id: string;
  company_id: string;
  source_ats: Ats;
  source_id: string;
  title: string;
  slug: string;
  apply_url: string;
  location_raw: string | null;
  locations: string[];
  workplace: Workplace;
  salary_min_cents: number | null;
  salary_max_cents: number | null;
  salary_currency: string;
  salary_source: SalarySource;
  yoe_min: number | null;
  function: string | null;
  seniority: string | null;
  skills: string[];
  description_html: string | null;
  description_text: string | null;
  summary: string | null;
  posted_at: string | null;
  first_seen_at: string;
  last_seen_at: string;
  closed_at: string | null;
  status: JobStatus;
  us_eligible: boolean;
  tech_eligible: boolean;
};

export const ATS_HOST_SUFFIXES = [
  "greenhouse.io",
  "ashbyhq.com",
  "lever.co",
  "workable.com",
  "rippling.com",
  "gem.com",
];

export const AGGREGATOR_HOSTS = [
  "indeed.com",
  "linkedin.com",
  "ziprecruiter.com",
  "glassdoor.com",
  "hotfix.jobs",
  "wellfound.com",
  "builtin.com",
];
