/** Shared page meta for search + social + AI crawlers. */
export const SITE_ORIGIN = "https://jobrow.vercel.app";

export const DEFAULT_DESCRIPTION =
  "Public register of still-open US tech roles from employer ATS boards. Not an employer.";

export const OG_IMAGE = `${SITE_ORIGIN}/og.jpg`;

/** Clean absolute URL: no query/hash, no trailing slash (homepage = origin + "/"). */
export function absoluteUrl(path = "/"): string {
  let p = (path || "/").split(/[?#]/)[0];
  if (!p.startsWith("/")) p = `/${p}`;
  p = p.replace(/\/+$/, "");
  return p ? `${SITE_ORIGIN}${p}` : `${SITE_ORIGIN}/`;
}

export function pageHead(opts: {
  title: string;
  description?: string;
  path?: string;
  ogType?: string;
  /** e.g. "noindex,follow" for closed job detail pages */
  robots?: string;
}) {
  const description = opts.description ?? DEFAULT_DESCRIPTION;
  const url = absoluteUrl(opts.path ?? "/");
  const title = opts.title;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      ...(opts.robots ? [{ name: "robots", content: opts.robots }] : []),
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
  return `${companyName} US tech roles still open - Jobrow`;
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
  return `${opts.title} at ${opts.companyName} - ${signal} | Jobrow`;
}

function clipMeta(text: string, max = 300): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

/** Unique meta description from facts already on the job row (no invented content). */
export function jobPageDescription(opts: {
  title: string;
  companyName: string;
  status?: string | null;
  summary?: string | null;
  location?: string | null;
  workplaceLabel?: string | null;
  pay?: string | null;
  boardLabel?: string | null;
  functionLabel?: string | null;
  seniority?: string | null;
}): string {
  if (opts.status === "closed") {
    return clipMeta(
      `${opts.title} at ${opts.companyName} left the employer board after a Jobrow crawl. Not still open.`,
    );
  }

  const facts: string[] = [];
  if (opts.workplaceLabel && opts.workplaceLabel !== "Unknown") facts.push(opts.workplaceLabel);
  if (opts.location?.trim()) facts.push(opts.location.trim());
  if (opts.pay && opts.pay !== "—") facts.push(`pay ${opts.pay}`);
  if (opts.functionLabel && opts.functionLabel !== "Unclassified") facts.push(opts.functionLabel);
  if (opts.seniority?.trim()) facts.push(opts.seniority.trim());
  if (opts.boardLabel) facts.push(`via ${opts.boardLabel}`);

  const lead = facts.length
    ? `${opts.title} at ${opts.companyName} (${facts.join(" · ")}). Still open on Jobrow — apply on the employer ATS.`
    : `${opts.title} at ${opts.companyName}. Still open on Jobrow — apply on the employer ATS.`;

  const summary = opts.summary?.trim();
  if (summary && !lead.toLowerCase().includes(summary.toLowerCase().slice(0, 40))) {
    return clipMeta(`${lead} ${summary}`);
  }
  return clipMeta(lead);
}

/** Short visible intro built only from known fields. */
export function jobPageIntro(opts: {
  title: string;
  companyName: string;
  status?: string | null;
  location?: string | null;
  workplaceLabel?: string | null;
  pay?: string | null;
  boardLabel?: string | null;
  firstSeenAgo?: string | null;
  lastSeenAgo?: string | null;
}): string {
  if (opts.status === "closed") {
    return `${opts.title} at ${opts.companyName} is no longer on the employer board. Jobrow marked it closed after a crawl that no longer listed this posting.`;
  }
  const placeBits = [opts.workplaceLabel, opts.location?.trim()].filter(
    (v): v is string => Boolean(v && v !== "Unknown" && v !== "—"),
  );
  const place = placeBits.length ? placeBits.join(" · ") : null;
  const pay = opts.pay && opts.pay !== "—" ? opts.pay : null;
  const board = opts.boardLabel ? opts.boardLabel : null;
  const seen =
    opts.firstSeenAgo && opts.firstSeenAgo !== "—"
      ? `First seen ${opts.firstSeenAgo}`
      : null;
  const last =
    opts.lastSeenAgo && opts.lastSeenAgo !== "—"
      ? `last confirmed ${opts.lastSeenAgo}`
      : null;
  const timing = [seen, last].filter(Boolean).join("; ");

  const clauses: string[] = [
    `${opts.title} is a still-open role at ${opts.companyName} on Jobrow.`,
  ];
  if (place) clauses.push(`Location: ${place}.`);
  if (pay) clauses.push(`Listed pay: ${pay}.`);
  if (board) clauses.push(`Sourced from the company's public ${board} board.`);
  if (timing) clauses.push(`${timing}.`);
  clauses.push("Apply on the employer ATS — Jobrow is not the employer.");
  return clauses.join(" ");
}
