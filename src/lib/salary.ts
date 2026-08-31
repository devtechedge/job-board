import type { SalarySource } from "./ats/types.ts";

export type SalaryGuess = {
  minCents: number | null;
  maxCents: number | null;
  currency: string;
  source: SalarySource;
};

const RANGE_RE =
  /(?:usd\s*)?\$?\s*(\d{2,3}(?:,\d{3})|\d{2,3})(?:\s*(?:k|000))?\s*(?:-|–|—|to)\s*\$?\s*(\d{2,3}(?:,\d{3})|\d{2,3})\s*(k)?/i;
const SINGLE_RE = /(?:usd\s*)?\$\s*(\d{2,3}(?:,\d{3})|\d{2,3})\s*(k)?/i;

function toCents(raw: string, kFlag: boolean): number | null {
  const compact = raw.replace(/,/g, "");
  const n = Number(compact);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (kFlag || (n >= 50 && n <= 900 && !raw.includes(","))) return Math.round(n * 1000 * 100);
  if (n < 1000) return null; // likely hourly
  return Math.round(n * 100);
}

export function dollarsToCents(value: number | null | undefined): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  if (value <= 0) return null;
  if (value < 200) return null; // hourly / stale
  if (value < 2000) return Math.round(value * 1000 * 100); // 180 meaning 180k
  if (value < 20_000_000) return Math.round(value * 100); // dollars
  return Math.round(value); // already cents
}

export function parseSalaryFromText(text: string | null | undefined): SalaryGuess {
  if (!text) return { minCents: null, maxCents: null, currency: "USD", source: "none" };
  const range = text.match(RANGE_RE);
  if (range) {
    const k = Boolean(range[3]) || /k/i.test(range[0]);
    const minCents = toCents(range[1], k);
    const maxCents = toCents(range[2], k);
    if (minCents || maxCents) {
      return {
        minCents,
        maxCents,
        currency: "USD",
        source: "inferred",
      };
    }
  }
  const single = text.match(SINGLE_RE);
  if (single) {
    const minCents = toCents(single[1], Boolean(single[2]));
    if (minCents) {
      return { minCents, maxCents: null, currency: "USD", source: "inferred" };
    }
  }
  return { minCents: null, maxCents: null, currency: "USD", source: "none" };
}

export function formatPay(
  minCents: number | null | undefined,
  maxCents: number | null | undefined,
  currency = "USD",
  source: SalarySource = "none",
): string {
  if (!minCents && !maxCents) return "—";
  const fmt = (cents: number) => {
    const dollars = cents / 100;
    if (dollars >= 1000) return `$${Math.round(dollars / 1000)}k`;
    return `$${Math.round(dollars).toLocaleString("en-US")}`;
  };
  const prefix = currency === "USD" ? "" : `${currency} `;
  const range =
    minCents && maxCents
      ? `${fmt(minCents)}–${fmt(maxCents)}`
      : fmt((minCents ?? maxCents) as number);
  return source === "inferred" ? `~${prefix}${range}` : `${prefix}${range}`;
}
