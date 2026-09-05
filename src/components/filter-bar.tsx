import { useState, type ReactNode } from "react";
import {
  ATS_FILTERS,
  FUNCTIONS,
  POSTED_WINDOWS,
  SENIORITIES,
  SORTS,
  WORKPLACES,
  sentenceToFilters,
  type JobQuery,
} from "@/lib/query";
import { Button } from "@/components/ui/button";

export function FilterBar({
  value,
  onChange,
}: {
  value: JobQuery;
  onChange: (next: Partial<JobQuery>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [sentence, setSentence] = useState("");

  return (
    <section className="border border-rule bg-paper">
      <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="sm:col-span-2 lg:col-span-4">
          <span className="mb-1 block text-[11px] uppercase tracking-wide text-muted">
            Query
          </span>
          <input
            className="ledger-input"
            placeholder="Title, company, or skill"
            value={value.q}
            onChange={(event) => onChange({ q: event.target.value, page: 1 })}
          />
        </label>
        <Field label="Function">
          <select
            className="ledger-select"
            value={value.fn}
            onChange={(event) => onChange({ fn: event.target.value, page: 1 })}
          >
            <option value="">Any</option>
            {FUNCTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Seniority">
          <select
            className="ledger-select"
            value={value.seniority}
            onChange={(event) => onChange({ seniority: event.target.value, page: 1 })}
          >
            <option value="">Any</option>
            {SENIORITIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Workplace">
          <select
            className="ledger-select"
            value={value.workplace}
            onChange={(event) => onChange({ workplace: event.target.value, page: 1 })}
          >
            <option value="">Any</option>
            {WORKPLACES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Location">
          <input
            className="ledger-input"
            placeholder="City or US"
            value={value.location}
            onChange={(event) => onChange({ location: event.target.value, page: 1 })}
          />
        </Field>
        <Field label="Pay floor">
          <select
            className="ledger-select"
            value={value.salaryMin ?? ""}
            onChange={(event) =>
              onChange({
                salaryMin: event.target.value ? Number(event.target.value) : null,
                page: 1,
              })
            }
          >
            <option value="">Any</option>
            {[100000, 150000, 180000, 200000, 250000].map((n) => (
              <option key={n} value={n}>
                ${n / 1000}k+
              </option>
            ))}
          </select>
        </Field>
        <Field label="First seen">
          <select
            className="ledger-select"
            value={value.posted}
            onChange={(event) => onChange({ posted: event.target.value, page: 1 })}
          >
            <option value="">Any time</option>
            {POSTED_WINDOWS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Board">
          <select
            className="ledger-select"
            value={value.ats}
            onChange={(event) => onChange({ ats: event.target.value, page: 1 })}
          >
            <option value="">Any ATS</option>
            {ATS_FILTERS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Sort">
          <select
            className="ledger-select"
            value={value.sort}
            onChange={(event) => onChange({ sort: event.target.value as JobQuery["sort"], page: 1 })}
          >
            {SORTS.map((item) => (
              <option key={item} value={item}>
                {item === "posted"
                  ? "Posted"
                  : item === "first_seen"
                    ? "First seen"
                    : item === "last_seen"
                      ? "Last seen"
                      : item === "salary"
                        ? "Pay"
                        : "Title"}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="border-t border-rule px-3 py-2">
        <button
          type="button"
          className="text-xs text-muted underline-offset-2 hover:text-ink hover:underline"
          onClick={() => setOpen((v) => !v)}
        >
          Turn a sentence into filters
        </button>
        {open ? (
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              className="ledger-input"
              placeholder="senior remote backend in nyc 180k"
              value={sentence}
              onChange={(event) => setSentence(event.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onChange({ ...sentenceToFilters(sentence), page: 1 });
              }}
            >
              Apply sentence
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label>
      <span className="mb-1 block text-[11px] uppercase tracking-wide text-muted">{label}</span>
      {children}
    </label>
  );
}
