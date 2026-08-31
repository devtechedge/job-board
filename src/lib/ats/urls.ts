/** Public board JSON endpoints. HTML career-page scraping is not the happy path. */

export function greenhouseListUrl(token: string): string {
  return `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(token)}/jobs?content=false`;
}

export function greenhouseDetailUrl(token: string, id: string): string {
  return `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(token)}/jobs/${encodeURIComponent(id)}`;
}

export function ashbyListUrl(token: string): string {
  // Public posting API used by jobs.ashbyhq.com/{org}. includeCompensation adds structured pay.
  return `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(token)}?includeCompensation=true`;
}

export function leverListUrl(token: string): string {
  return `https://api.lever.co/v0/postings/${encodeURIComponent(token)}?mode=json`;
}

export function workableListUrl(token: string): string {
  return `https://apply.workable.com/api/v1/widget/accounts/${encodeURIComponent(token)}`;
}
