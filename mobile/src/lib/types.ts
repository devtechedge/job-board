export type PublicCompanyCard = {
  id?: string;
  slug: string;
  name: string;
  website: string | null;
  logo_url: string | null;
};

export type PublicJob = {
  id: string;
  title: string;
  slug: string;
  apply_url: string;
  location_raw: string | null;
  locations: string[];
  workplace: string;
  salary_min_cents: number | null;
  salary_max_cents: number | null;
  salary_currency: string;
  salary_source: string;
  salary_label: string;
  function: string | null;
  seniority: string | null;
  skills: string[];
  summary: string | null;
  posted_at: string | null;
  first_seen_at: string;
  last_seen_at: string;
  status: string;
  source_ats: string;
  company: PublicCompanyCard & { id: string };
  description_html?: string | null;
  description_text?: string | null;
};

export type PublicCompany = {
  id: string;
  slug: string;
  name: string;
  ats: string;
  careers_url: string | null;
  website: string | null;
  logo_url: string | null;
  hq_country: string;
  last_ok_at: string | null;
  enabled: boolean;
  open_count: number;
  listed_count: number | null;
};

export type HomeDigest = {
  openCount: number;
  companyCount: number;
  lastOkAt: string | null;
  closedCount: number;
  freshCount: number;
  lastWindowOpened: number;
  lastWindowClosed: number;
  lastWindowAt: string | null;
  functions: Array<{ fn: string; n: number }>;
  boards: Array<{
    slug: string;
    name: string;
    ats: string;
    open_count: number;
    website: string | null;
    logo_url: string | null;
  }>;
  editionAt: string;
  editionLabel: string;
};

export type JobsResponse = {
  jobs: PublicJob[];
  total: number;
  page: number;
  pageSize: number;
  stats: { openCount: number; companyCount: number; lastOkAt: string | null };
  indexing?: boolean;
};

export type HomeResponse = JobsResponse & { digest: HomeDigest };

export type JobQuery = {
  q?: string;
  fn?: string;
  seniority?: string;
  workplace?: string;
  location?: string;
  salaryMin?: number | null;
  posted?: string;
  ats?: string;
  company?: string;
  sort?: string;
  page?: number;
};

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

export const SENIORITIES = ["intern", "junior", "mid", "senior", "staff", "principal", "manager"] as const;
export const WORKPLACES = ["remote", "hybrid", "onsite"] as const;
export const ATS_FILTERS = ["greenhouse", "ashby", "lever"] as const;
export const POSTED_WINDOWS = ["1d", "3d", "7d", "14d", "30d"] as const;
export const SORTS = ["last_seen", "first_seen", "salary", "title"] as const;
