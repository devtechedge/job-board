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
const PAY_CONTEXT_RE = /salary|compensation|base pay|pay range|pay transparency|total base|annual pay|yearly/i;
const NOISE_RE = /trillion|billion|aum|assets under|market cap|valuation/i;

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

/** Structured Greenhouse/Ashby metadata objects — only use numbers the board posted. */
export function payFromMetaValue(
  value: unknown,
  currencyFallback = "USD",
): SalaryGuess {
  if (value == null || value === "") {
    return { minCents: null, maxCents: null, currency: currencyFallback, source: "none" };
  }
  if (typeof value === "object") {
    const o = value as Record<string, unknown>;
    const minRaw = o.min_value ?? o.minValue ?? o.min ?? o.amount;
    const maxRaw = o.max_value ?? o.maxValue ?? o.max ?? o.amount;
    const min = dollarsToCents(minRaw == null ? null : Number(minRaw));
    const max = dollarsToCents(maxRaw == null ? null : Number(maxRaw));
    const currency = String(o.unit ?? o.currency ?? o.currencyCode ?? currencyFallback) || currencyFallback;
    if (min || max) {
      return { minCents: min, maxCents: max, currency, source: "posted" };
    }
    return { minCents: null, maxCents: null, currency, source: "none" };
  }
  if (typeof value === "number") {
    const cents = dollarsToCents(value);
    return cents
      ? { minCents: cents, maxCents: null, currency: currencyFallback, source: "posted" }
      : { minCents: null, maxCents: null, currency: currencyFallback, source: "none" };
  }
  return parseSalaryFromText(String(value));
}

function windowAround(text: string, index: number, radius = 80): string {
  return text.slice(Math.max(0, index - radius), Math.min(text.length, index + radius));
}

export function parseSalaryFromText(text: string | null | undefined): SalaryGuess {
  if (!text) return { minCents: null, maxCents: null, currency: "USD", source: "none" };
  // Prefer spans that sit near explicit pay wording so we do not pick up "$124 trillion".
  const candidates: Array<{ start: number; match: RegExpMatchArray; kind: "range" | "single" }> = [];
  for (const m of text.matchAll(new RegExp(RANGE_RE.source, "gi"))) {
    if (m.index == null) continue;
    candidates.push({ start: m.index, match: m, kind: "range" });
  }
  for (const m of text.matchAll(new RegExp(SINGLE_RE.source, "gi"))) {
    if (m.index == null) continue;
    candidates.push({ start: m.index, match: m, kind: "single" });
  }
  candidates.sort((a, b) => a.start - b.start);

  for (const cand of candidates) {
    const ctx = windowAround(text, cand.start);
    if (NOISE_RE.test(ctx)) continue;
    if (!PAY_CONTEXT_RE.test(ctx) && !PAY_CONTEXT_RE.test(text.slice(0, 500))) {
      // Allow when the whole short string is itself a pay snippet (metadata).
      if (text.length > 120) continue;
    }
    if (cand.kind === "range") {
      const range = cand.match;
      const k = Boolean(range[3]) || /k/i.test(range[0]);
      const minCents = toCents(range[1], k);
      const maxCents = toCents(range[2], k);
      if (minCents || maxCents) {
        return { minCents, maxCents, currency: "USD", source: "inferred" };
      }
    } else {
      const single = cand.match;
      const minCents = toCents(single[1], Boolean(single[2]));
      if (minCents) {
        return { minCents, maxCents: null, currency: "USD", source: "inferred" };
      }
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
  const code = (currency || "USD").toUpperCase();
  const fmtUsd = (cents: number) => {
    const dollars = cents / 100;
    if (dollars >= 1000) return `$${Math.round(dollars / 1000)}k`;
    return `$${Math.round(dollars).toLocaleString("en-US")}`;
  };
  const fmtAmt = (cents: number) => {
    const dollars = cents / 100;
    if (dollars >= 1000) return `${Math.round(dollars / 1000)}k`;
    return Math.round(dollars).toLocaleString("en-US");
  };
  let range: string;
  if (code === "USD") {
    range =
      minCents && maxCents
        ? `${fmtUsd(minCents)}–${fmtUsd(maxCents)}`
        : fmtUsd((minCents ?? maxCents) as number);
  } else {
    // Non-USD: ISO code once (never invent a $ conversion).
    range =
      minCents && maxCents
        ? `${code} ${fmtAmt(minCents)}–${fmtAmt(maxCents)}`
        : `${code} ${fmtAmt((minCents ?? maxCents) as number)}`;
  }
  return source === "inferred" ? `~${range}` : range;
}
