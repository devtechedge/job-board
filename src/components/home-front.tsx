import { Link } from "@tanstack/react-router";
import { CompanyNameLink } from "@/components/company-mark";
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
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
          {editionDateLabel(digest.editionAt)}
        </p>
        <p className="font-serif text-sm tabular-nums text-ink">
          {n(digest.openCount)} open · {digest.companyCount} boards
        </p>
      </div>
    </div>
  );
}

export function EditionTally({ digest }: { digest: HomeDigest }) {
  const cells = [
    { k: "Open", v: n(digest.openCount) },
    { k: "Boards", v: n(digest.companyCount) },
    { k: "First seen, 24h", v: n(digest.freshCount) },
    {
      k: "Last crawl ±",
      v: `${n(digest.lastWindowOpened)} / ${n(digest.lastWindowClosed)}`,
      extra: digest.lastWindowAt ? ago(digest.lastWindowAt) : null,
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
          {cell.extra ? <p className="mt-2 text-xs text-muted">{cell.extra}</p> : null}
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
        <h2 className="font-serif text-2xl font-semibold">Functions</h2>
        <Link to="/jobs" className="text-sm text-muted hover:text-pine">
          Index
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
        <h2 className="font-serif text-2xl font-semibold">Boards</h2>
        <Link to="/companies" className="text-sm text-muted hover:text-pine">
          All
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
              <CompanyNameLink
                name={board.name}
                slug={board.slug}
                website={board.website}
                logoUrl={board.logo_url}
                className="font-medium"
              />
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
