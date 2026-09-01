import { Link, createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ApplyLink } from "@/components/apply-link";
import { SourceBadge } from "@/components/source-badge";
import { AppShell } from "@/components/site-footer";
import { WatchButton } from "@/components/watch-button";
import { ago, workplaceLabel } from "@/lib/format";
import { getJobFn } from "@/lib/jobs.functions";
import { formatPay } from "@/lib/salary";
import { jsonForScript } from "@/lib/safe";

export const Route = createFileRoute("/jobs/$id")({
  loader: ({ params }) => getJobFn({ data: { id: params.id } }),
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} at ${loaderData.company_name} — Jobrow` },
          {
            name: "description",
            content: loaderData.summary ?? `${loaderData.title} at ${loaderData.company_name}`,
          },
        ]
      : [{ title: "Role — Jobrow" }],
  }),
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.summary ?? job.title,
    datePosted: job.posted_at ?? job.first_seen_at,
    hiringOrganization: {
      "@type": "Organization",
      name: job.company_name,
    },
    employmentType: "FULL_TIME",
    jobLocationType: job.workplace === "remote" ? "TELECOMMUTE" : undefined,
    url: job.apply_url,
    identifier: {
      "@type": "PropertyValue",
      name: "Jobrow",
      value: job.id,
    },
  };

  return (
    <AppShell current="/jobs">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonForScript(jsonLd) }} />
        <p className="text-sm">
          <Link to="/jobs" className="text-muted hover:text-pine">
            Index
          </Link>
          <span className="text-rule-strong"> / </span>
          <Link
            to="/companies/$slug"
            params={{ slug: job.company_slug }}
            className="hover:text-pine"
          >
            {job.company_name}
          </Link>
        </p>
        <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
          {job.title}
        </h1>
        <p className="mt-2 text-muted">
          {job.company_name}
          {job.status === "closed" ? " · Closed" : ""}
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-3 border border-rule bg-inset p-4 text-sm sm:grid-cols-3">
          <Fact label="Pay" value={pay} />
          <Fact label="Workplace" value={workplaceLabel(job.workplace)} />
          <Fact label="Location" value={job.location_raw || "—"} />
          <Fact label="First seen" value={ago(job.first_seen_at)} />
          <Fact label="Last seen" value={ago(job.last_seen_at)} />
          <Fact label="Board" value={<SourceBadge ats={job.source_ats} />} />
        </dl>
        {job.salary_source === "inferred" ? (
          <p className="mt-2 text-xs text-muted">~ pay inferred from posting text.</p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2">
          <ApplyLink href={job.apply_url} company={job.company_name} />
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
          <h2 className="text-[11px] uppercase tracking-[0.16em] text-muted">Summary</h2>
          <p className="mt-2 text-base">{job.summary || job.title}</p>
        </section>
        {job.skills.length ? (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {job.skills.map((skill) => (
              <li key={skill} className="rounded-sm border border-rule px-2 py-0.5 text-xs text-muted">
                {skill}
              </li>
            ))}
          </ul>
        ) : null}
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
