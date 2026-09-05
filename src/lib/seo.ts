/** Shared page meta for search + social + AI crawlers. */
export const SITE_ORIGIN = "https://jobrow.vercel.app";

export const DEFAULT_DESCRIPTION =
  "Public register of still-open US tech roles from employer ATS boards. Not an employer.";

export const OG_IMAGE = `${SITE_ORIGIN}/og.jpg`;

export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return SITE_ORIGIN;
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageHead(opts: {
  title: string;
  description?: string;
  path?: string;
  ogType?: string;
}) {
  const description = opts.description ?? DEFAULT_DESCRIPTION;
  const url = absoluteUrl(opts.path ?? "/");
  const title = opts.title;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:type", content: opts.ogType ?? "website" },
      { property: "og:site_name", content: "Jobrow" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

/** Long-tail document titles for indexable entity pages. */
export function companyPageTitle(companyName: string): string {
  return `${companyName} US tech roles still open — Jobrow`;
}

export function companyPageDescription(companyName: string, openCount: number): string {
  const n = Number.isFinite(openCount) ? openCount : 0;
  return `${n} still-open US tech role${n === 1 ? "" : "s"} at ${companyName} on Jobrow. Apply on the employer ATS.`;
}

export function jobPageTitle(opts: {
  title: string;
  companyName: string;
  status?: string | null;
}): string {
  const closed = opts.status === "closed";
  const signal = closed ? "closed" : "still open";
  return `${opts.title} at ${opts.companyName} — ${signal} | Jobrow`;
}

export function jobPageDescription(opts: {
  title: string;
  companyName: string;
  status?: string | null;
  summary?: string | null;
}): string {
  if (opts.status === "closed") {
    return `${opts.title} at ${opts.companyName} left the employer board after a Jobrow crawl. Not still open.`;
  }
  if (opts.summary && opts.summary.trim()) return opts.summary.trim();
  return `${opts.title} at ${opts.companyName}. Still open on Jobrow — apply on the employer ATS.`;
}

