import { createHash } from "node:crypto";

/**
 * The normalized fields that decide what a stored job row contains.
 *
 * Deliberately declared here rather than imported from `@/lib/normalize` so this
 * module stays dependency-free and runnable under `node --test`.
 */
export type FingerprintFields = {
  title: string;
  applyUrl: string;
  locationRaw: string;
  locations: string[];
  workplace: string;
  salaryMinCents: number | null;
  salaryMaxCents: number | null;
  salaryCurrency: string;
  salarySource: string;
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
  rawJson: string;
  searchText: string;
};

/**
 * Stable fingerprint of everything the crawler writes into a job row.
 *
 * The crawler compares this against the stored `jobs.content_hash` and only
 * issues an UPDATE when it differs. That is what keeps an unchanged posting from
 * being re-TOASTed (descriptions run to tens of kilobytes) on every run - the
 * single largest driver of database growth in this app.
 *
 * Truncated to 32 hex chars: this only detects change, it is not a security
 * boundary, and a shorter value keeps the row narrow.
 */
export function contentHash(job: FingerprintFields): string {
  return createHash("sha256")
    .update(
      JSON.stringify([
        job.title,
        job.applyUrl,
        job.locationRaw,
        job.locations,
        job.workplace,
        job.salaryMinCents,
        job.salaryMaxCents,
        job.salaryCurrency,
        job.salarySource,
        job.yoeMin,
        job.function,
        job.seniority,
        job.skills,
        job.descriptionHtml,
        job.descriptionText,
        job.summary,
        job.postedAt,
        job.usEligible,
        job.techEligible,
        job.rawJson,
        job.searchText,
      ]),
    )
    .digest("hex")
    .slice(0, 32);
}
