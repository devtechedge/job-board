import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { ApplyLink } from "@/components/apply-link";
import { CompanyMark, CompanyNameLink } from "@/components/company-mark";
import { SourceBadge } from "@/components/source-badge";
import { WatchButton } from "@/components/watch-button";
import { ago, workplaceLabel } from "@/lib/format";
import { formatPay } from "@/lib/salary";
import type { JobListItem } from "@/lib/search";
import { cn } from "@/lib/utils";

export function RegisterTable({
  jobs,
  empty,
  variant = "open",
}: {
  jobs: JobListItem[];
  empty?: string;
  variant?: "open" | "expired";
}) {
  if (!jobs.length) {
    return (
      <p className="border border-rule bg-inset px-4 py-10 text-center text-sm text-muted">
        {empty ?? "No matches."}
      </p>
    );
  }

  return (
    <div className="border border-rule bg-paper">
      <div className="hidden border-b border-rule bg-inset px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-muted md:grid md:grid-cols-[2fr_1fr_0.8fr_0.8fr_1fr_0.7fr] md:gap-3">
        <span>Title</span>
        <span>Company</span>
        <span>Pay</span>
        <span>Workplace</span>
        <span>{variant === "expired" ? "Expired" : "Posted"}</span>
        <span>Source</span>
      </div>
      <ul>
        {jobs.map((job) => (
          <RegisterRow key={job.id} job={job} variant={variant} />
        ))}
      </ul>
    </div>
  );
}

function RegisterRow({ job, variant = "open" }: { job: JobListItem; variant?: "open" | "expired" }) {
  const [open, setOpen] = useState(false);
  const pay = formatPay(
    job.salary_min_cents,
    job.salary_max_cents,
    job.salary_currency,
    job.salary_source,
  );
  const when = ago(variant === "expired" ? (job.closed_at ?? job.last_seen_at) : job.first_seen_at);

  return (
    <li className="border-b border-rule last:border-b-0">
      <div className="grid items-center gap-1 px-3 py-3 md:grid-cols-[2fr_1fr_0.8fr_0.8fr_1fr_0.7fr] md:gap-3 md:py-2.5">
        <div className="min-w-0">
          <div className="flex items-start gap-2">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="mt-0.5 inline-flex size-11 shrink-0 items-center justify-center text-muted hover:text-ink md:size-6 md:mt-1"
              aria-expanded={open}
              aria-label={open ? "Hide summary" : "Expand row"}
            >
              <ChevronDown className={cn("size-4 transition-transform duration-150", open && "rotate-180")} />
            </button>
            <div className="min-w-0">
              <Link
                to="/jobs/$id"
                params={{ id: job.id }}
                className="block truncate font-medium text-ink hover:text-pine"
              >
                {job.title}
              </Link>
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted md:hidden">
                <CompanyMark
                  name={job.company_name}
                  website={job.company_website}
                  logoUrl={job.company_logo_url}
                  size={14}
                />
                <span className="truncate">
                  {job.company_name} · {pay} · {workplaceLabel(job.workplace)}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="hidden min-w-0 md:block">
          <CompanyNameLink
            name={job.company_name}
            slug={job.company_slug}
            website={job.company_website}
            logoUrl={job.company_logo_url}
            className="text-sm"
          />
        </div>
        <span className="hidden text-sm tabular-nums md:block">{pay}</span>
        <span className="hidden text-sm md:block">{workplaceLabel(job.workplace)}</span>
        <span className="hidden text-sm text-muted md:block">{when}</span>
        <div className="hidden md:block">
          <SourceBadge ats={job.source_ats} />
        </div>
        <div className="col-span-full flex items-center justify-between gap-2 pl-11 md:hidden">
          <SourceBadge ats={job.source_ats} />
          <span className="text-xs text-muted">{when}</span>
        </div>
      </div>
      {open ? (
        <div className="space-y-3 border-t border-rule bg-inset px-3 py-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Summary</p>
          <p className="max-w-3xl text-sm">{job.summary || job.title}</p>
          {job.skills.length ? (
            <ul className="flex flex-wrap gap-1.5">
              {job.skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-sm border border-rule bg-paper px-2 py-0.5 text-xs text-muted"
                >
                  {skill}
                </li>
              ))}
            </ul>
          ) : null}
          <p className="text-xs text-muted">{job.location_raw || "Location not stated"}</p>
          <div className="flex flex-wrap items-center gap-2">
            <ApplyLink href={job.apply_url} company={job.company_name} />
            <WatchButton
              item={{
                id: job.id,
                title: job.title,
                company: job.company_name,
                href: `/jobs/${job.id}`,
              }}
            />
            <Link
              to="/jobs/$id"
              params={{ id: job.id }}
              className="text-sm underline underline-offset-4 hover:text-pine"
            >
              Full posting
            </Link>
          </div>
        </div>
      ) : null}
    </li>
  );
}
