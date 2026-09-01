import { Link } from "@tanstack/react-router";
import { SourceBadge } from "@/components/source-badge";
import { ago, editionDateLabel, functionLabel } from "@/lib/format";
import { compactSearch, DEFAULT_QUERY } from "@/lib/query";
import type { HomeDigest } from "@/lib/search";

function n(value: number): string {
  return value.toLocaleString("en-US");
}

export function EditionMasthead({ digest }: { digest: HomeDigest }) {
  return (
    <div className="border-y-2 border-ink py-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-serif text-sm italic text-muted">Public ATS register · US tech</p>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-muted">
            {editionDateLabel(digest.editionAt)} · UTC edition
          </p>
        </div>
        <p className="font-serif text-sm tabular-nums text-ink">
          {n(digest.openCount)} on the register · {digest.companyCount} boards
        </p>
      </div>
    </div>
  );
}

export function EditionTally({ digest }: { digest: HomeDigest }) {
  const cells = [
    { k: "On the register", v: n(digest.openCount), d: "US tech roles still on a successful crawl" },
    { k: "Boards read", v: n(digest.companyCount), d: "Enabled employer JSON endpoints" },
    { k: "First seen, 24h", v: n(digest.freshCount), d: "New rows since the last day on the clock" },
    {
      k: "Last crawl window",
      v: `${n(digest.lastWindowOpened)} / ${n(digest.lastWindowClosed)}`,
      d: digest.lastWindowAt
        ? `Opened / dropped ${ago(digest.lastWindowAt)}`
        : "No finished crawl run yet",
    },
  ];
  return (
    <dl className="grid grid-cols-2 border border-rule bg-paper sm:grid-cols-4">
      {cells.map((cell, i) => (
        <div
          key={cell.k}
          className={
            i === 0
              ? "border-r border-b border-rule px-4 py-4 sm:border-b-0"
              : i === 1
                ? "border-b border-rule px-4 py-4 sm:border-b-0 sm:border-r"
                : i === 2
                  ? "border-r border-rule px-4 py-4"
                  : "px-4 py-4"
          }
        >
          <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">{cell.k}</dt>
          <dd className="mt-2 font-serif text-3xl font-semibold tabular-nums leading-none">{cell.v}</dd>
          <p className="mt-2 text-xs leading-snug text-muted">{cell.d}</p>
        </div>
      ))}
    </dl>
  );
}

export function FunctionContents({ items }: { items: HomeDigest["functions"] }) {
  if (!items.length) return null;
  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="font-serif text-2xl font-semibold">Contents</h2>
        <Link to="/jobs" className="text-sm text-muted hover:text-pine">
          Full index
        </Link>
      </div>
      <ul className="columns-1 gap-x-8 border-t border-ink sm:columns-2 lg:columns-3">
        {items.map((item) => (
          <li key={item.fn} className="break-inside-avoid border-b border-rule">
            <Link
              to="/jobs"
              search={compactSearch({ ...DEFAULT_QUERY, fn: item.fn })}
              className="flex items-baseline justify-between gap-3 py-2 text-sm hover:text-pine"
            >
              <span>{functionLabel(item.fn)}</span>
              <span className="tabular-nums text-muted">{n(item.n)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function BoardStrip({ boards }: { boards: HomeDigest["boards"] }) {
  if (!boards.length) return null;
  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="font-serif text-2xl font-semibold">Boards on the register</h2>
        <Link to="/companies" className="text-sm text-muted hover:text-pine">
          All companies
        </Link>
      </div>
      <div className="border border-rule">
        <div className="hidden border-b border-rule bg-inset px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-muted sm:grid sm:grid-cols-[1fr_7rem_6rem]">
          <span>Company</span>
          <span>Open</span>
          <span>Board</span>
        </div>
        <ul>
          {boards.map((board) => (
            <li
              key={board.slug}
              className="grid grid-cols-[1fr_auto] items-center gap-3 border-t border-rule px-3 py-2.5 first:border-t-0 sm:grid-cols-[1fr_7rem_6rem]"
            >
              <Link
                to="/companies/$slug"
                params={{ slug: board.slug }}
                className="truncate font-medium hover:text-pine"
              >
                {board.name}
              </Link>
              <Link
                to="/jobs"
                search={compactSearch({ ...DEFAULT_QUERY, company: board.slug })}
                className="tabular-nums text-sm text-muted hover:text-pine"
              >
                {n(board.open_count)}
              </Link>
              <div className="hidden sm:block">
                <SourceBadge ats={board.ats} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function HowToRead() {
  const rules = [
    {
      k: "01",
      t: "We are not the employer",
      d: "Apply leaves Jobrow for the URL already on Greenhouse, Ashby, or Lever. Confirm pay and eligibility there.",
    },
    {
      k: "02",
      t: "Present on a successful fetch",
      d: "A role stays while the public JSON still lists it. A failed crawl does not close the set. Dropped after a clean miss.",
    },
    {
      k: "03",
      t: "Watchlist stays in this browser",
      d: "Search is free. Courier mail and ruled pins are a rate card, not a charge in this build. Hiring teams request a crawl slot first.",
    },
  ];
  return (
    <section>
      <h2 className="mb-3 font-serif text-2xl font-semibold">How to read this register</h2>
      <ol className="grid gap-px border border-rule bg-rule sm:grid-cols-3">
        {rules.map((rule) => (
          <li key={rule.k} className="bg-paper px-4 py-5">
            <p className="font-mono text-[11px] text-muted">{rule.k}</p>
            <h3 className="mt-2 font-serif text-xl font-semibold">{rule.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{rule.d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
