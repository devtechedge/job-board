import { Link, createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ApplyLink } from "@/components/apply-link";
import { CompanyMark, CompanyNameLink } from "@/components/company-mark";
import { SourceBadge } from "@/components/source-badge";
import { AppShell } from "@/components/site-footer";
import { WatchButton } from "@/components/watch-button";
import { ago, atsLabel, functionLabel, workplaceLabel } from "@/lib/format";
import { getJobFn } from "@/lib/jobs.functions";
import { formatPay } from "@/lib/salary";
import { jsonForScript } from "@/lib/safe";
import {
  jobPageDescription,
  jobPageIntro,
  jobPageTitle,
  pageHead,
} from "@/lib/seo";

export const Route = createFileRoute("/jobs/$id")({
  loader: ({ params }) => getJobFn({ data: { id: params.id } }),
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Role not found - Jobrow" }, { name: "robots", content: "noindex" }],
      };
    }
    const pay = formatPay(
      loaderData.salary_min_cents,
      loaderData.salary_max_cents,
      loaderData.salary_currency,
      loaderData.salary_source,
    );
    const title = jobPageTitle({
      title: loaderData.title,
      companyName: loaderData.company_name,
      status: loaderData.status,
    });
    const description = jobPageDescription({
      title: loaderData.title,
      companyName: loaderData.company_name,
      status: loaderData.status,
      summary: loaderData.summary,
      location: loaderData.location_raw,
      workplaceLabel: workplaceLabel(loaderData.workplace),
      pay,
      boardLabel: atsLabel(loaderData.source_ats),
      functionLabel: functionLabel(loaderData.function),
      seniority: loaderData.seniority,
    });
    return pageHead({
      title,
      description,
      path: `/jobs/${loaderData.id}`,
      ogType: "article",
      robots: loaderData.status === "closed" ? "noindex,follow" : undefined,
    });
  },
  component: JobPage,
});

function JobPage() {
  const job = Route.useLoaderData();
  const pay = formatPay(
    job.salary_min_cents,
    job.salary_max_cents,
    job.salary_currency,
    job.salary_source,
  );
  const closed = job.status === "closed";
  const workplace = workplaceLabel(job.workplace);
  const board = atsLabel(job.source_ats);
  const fn = functionLabel(job.function);
  const intro = jobPageIntro({
    title: job.title,
    companyName: job.company_name,
    status: job.status,
    location: job.location_raw,
    workplaceLabel: workplace,
    pay,
    boardLabel: board,
    firstSeenAgo: ago(job.first_seen_at),
    lastSeenAgo: ago(job.last_seen_at),
  });
  const summaryText =
    job.summary?.trim() ||
    (job.description_text?.trim()
      ? job.description_text.trim().slice(0, 480) +
        (job.description_text.trim().length > 480 ? "…" : "")
      : null);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: summaryText || job.title,
    datePosted: job.posted_at ?? job.first_seen_at,
    hiringOrganization: {
      "@type": "Organization",
      name: job.company_name,
      ...(job.company_website ? { sameAs: job.company_website } : {}),
    },
    employmentType: "FULL_TIME",
    url: job.apply_url,
    identifier: {
      "@type": "PropertyValue",
      name: "Jobrow",
      value: job.id,
    },
  };
  if (job.workplace === "remote") {
    jsonLd.jobLocationType = "TELECOMMUTE";
  }
  if (job.location_raw) {
    jsonLd.jobLocation = {
      "@type": "Place",
      address: job.location_raw,
    };
  }
  if (closed && job.closed_at) {
    jsonLd.validThrough = job.closed_at;
  }

  return (
    <AppShell current="/jobs">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {!closed ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonForScript(jsonLd) }}
          />
        ) : null}
        <p className="text-sm">
          <Link to="/jobs" className="text-muted hover:text-pine">
            Index
          </Link>
          <span className="text-rule-strong"> / </span>
          <CompanyNameLink
            name={job.company_name}
            slug={job.company_slug}
            website={job.company_website}
            logoUrl={job.company_logo_url}
          />
        </p>
        <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
          {job.title}
        </h1>
        <p className="mt-2 flex items-center gap-2 text-muted">
          <CompanyMark
            name={job.company_name}
            website={job.company_website}
            logoUrl={job.company_logo_url}
            size={22}
          />
          {job.company_name}
          {closed ? " · Closed" : ""}
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink/90">{intro}</p>
        <dl className="mt-6 grid grid-cols-2 gap-3 border border-rule bg-inset p-4 text-sm sm:grid-cols-3">
          <Fact label="Pay" value={pay} />
          <Fact label="Workplace" value={workplace} />
          <Fact label="Location" value={job.location_raw || "—"} />
          <Fact label="First seen" value={ago(job.first_seen_at)} />
          <Fact label="Last seen" value={ago(job.last_seen_at)} />
          <Fact label="Board" value={<SourceBadge ats={job.source_ats} />} />
        </dl>
        {job.salary_source === "inferred" ? (
          <p className="mt-2 text-xs text-muted">~ pay inferred from posting text.</p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2">
          {!closed ? <ApplyLink href={job.apply_url} company={job.company_name} /> : null}
          {closed ? (
            <Link
              to="/closed"
              search={{ page: 1 }}
              className="inline-flex items-center rounded-sm border border-rule px-3 py-1.5 text-sm text-muted hover:text-pine"
            >
              Browse closed roles
            </Link>
          ) : null}
          <WatchButton
            item={{
              id: job.id,
              title: job.title,
              company: job.company_name,
              href: `/jobs/${job.id}`,
            }}
          />
        </div>

        <section className="mt-10 border-t border-rule pt-6">
          <h2 className="font-serif text-xl font-semibold">About this role</h2>
          <p className="mt-2 text-base leading-relaxed">
            {summaryText ||
              `${job.title} at ${job.company_name}. See the employer posting below for the full description.`}
          </p>
          {(fn !== "Unclassified" || job.seniority || job.skills.length > 0) && (
            <ul className="mt-4 space-y-1 text-sm text-muted">
              {fn !== "Unclassified" ? (
                <li>
                  Function: <span className="text-ink">{fn}</span>
                </li>
              ) : null}
              {job.seniority ? (
                <li>
                  Seniority: <span className="text-ink">{job.seniority}</span>
                </li>
              ) : null}
            </ul>
          )}
          {job.skills.length ? (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {job.skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-sm border border-rule px-2 py-0.5 text-xs text-muted"
                >
                  {skill}
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="mt-10 border-t border-rule pt-6">
          <h2 className="font-serif text-xl font-semibold">Location &amp; pay</h2>
          <p className="mt-2 text-base leading-relaxed">
            {[
              workplace !== "Unknown" ? workplace : null,
              job.location_raw?.trim() || null,
            ]
              .filter(Boolean)
              .join(" · ") || "Location not stated on the board listing."}
            {pay !== "—"
              ? ` Listed pay on Jobrow: ${pay}${
                  job.salary_source === "inferred" ? " (inferred from posting text)" : ""
                }.`
              : " No pay range was listed on the public board feed."}
          </p>
        </section>

        <section className="mt-10 border-t border-rule pt-6">
          <h2 className="font-serif text-xl font-semibold">Source</h2>
          <p className="mt-2 text-base leading-relaxed">
            Jobrow reads the public {board} board for {job.company_name}. First seen{" "}
            {ago(job.first_seen_at)}; last seen {ago(job.last_seen_at)}
            {closed && job.closed_at ? `; closed ${ago(job.closed_at)}` : ""}. We are not the
            employer — apply only on the company ATS.
          </p>
        </section>

        <section className="mt-10 border-t border-rule pt-6">
          <h2 className="font-serif text-xl font-semibold">Posting</h2>
          {job.description_html ? (
            <div
              className="job-prose mt-4"
              dangerouslySetInnerHTML={{ __html: job.description_html }}
            />
          ) : (
            <p className="mt-4 whitespace-pre-wrap text-sm text-muted">
              {job.description_text || "Open the employer board for the full posting."}
            </p>
          )}
        </section>

        {!closed && job.related.length > 0 ? (
          <section className="mt-10 border-t border-rule pt-6">
            <h2 className="font-serif text-xl font-semibold">
              Other open roles at {job.company_name}
            </h2>
            <ul className="mt-4 divide-y divide-rule border border-rule">
              {job.related.map((r) => (
                <li key={r.id} className="flex flex-col gap-0.5 px-3 py-3 sm:flex-row sm:items-baseline sm:justify-between">
                  <Link to="/jobs/$id" params={{ id: r.id }} className="font-medium hover:text-pine">
                    {r.title}
                  </Link>
                  <span className="text-sm text-muted">
                    {[workplaceLabel(r.workplace), r.location_raw, formatPay(r.salary_min_cents, r.salary_max_cents, r.salary_currency, r.salary_source)]
                      .filter((v) => v && v !== "—" && v !== "Unknown")
                      .join(" · ") || "Still open"}
                  </span>
                </li>
              ))}
            </ul>
            {job.company_slug ? (
              <p className="mt-3 text-sm">
                <Link
                  to="/companies/$slug"
                  params={{ slug: job.company_slug }}
                  className="text-muted hover:text-pine"
                >
                  All open roles at {job.company_name}
                </Link>
              </p>
            ) : null}
          </section>
        ) : null}
      </main>
    </AppShell>
  );
}

function Fact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}
