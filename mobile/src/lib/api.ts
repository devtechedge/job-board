import { API_BASE } from "./config";
import type { HomeResponse, JobQuery, JobsResponse, PublicCompany, PublicJob } from "./types";

async function getJson<T>(path: string, params?: JobQuery): Promise<T> {
  const url = new URL(path, `${API_BASE}/`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value == null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = (await response.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  return (await response.json()) as T;
}

export function fetchHome(params: JobQuery = {}): Promise<HomeResponse> {
  return getJson<HomeResponse>("/api/home", { ...params, page: params.page ?? 1 });
}

export function fetchJobs(params: JobQuery = {}): Promise<JobsResponse> {
  return getJson<JobsResponse>("/api/jobs", params);
}

export function fetchJob(id: string): Promise<{ job: PublicJob }> {
  return getJson<{ job: PublicJob }>(`/api/jobs/${id}`);
}

export function fetchCompanies(): Promise<{ companies: PublicCompany[] }> {
  return getJson("/api/companies");
}

export function fetchCompany(slug: string): Promise<{ company: PublicCompany; jobs: PublicJob[] }> {
  return getJson(`/api/companies/${slug}`);
}

export async function postDesk(note: {
  kind?: string;
  name?: string;
  email: string;
  body: string;
  listingUrl?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const response = await fetch(`${API_BASE}/api/desk`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ kind: "write", ...note }),
  });
  try {
    return (await response.json()) as { ok: boolean; error?: string };
  } catch {
    return { ok: false, error: `HTTP ${response.status}` };
  }
}
