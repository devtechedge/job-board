import { createHash, timingSafeEqual } from "node:crypto";

export {
  BOARD_TOKEN_RE,
  UUID_RE,
  SLUG_RE,
  isPrivateHost,
  publicHttpsUrl,
  assertAtsFetchUrl,
  jsonForScript,
  xmlEscape,
} from "./safe.ts";

export function secretEqual(given: string, expected: string): boolean {
  const a = createHash("sha256").update(given, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export function clientIp(request: Request): string {
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 80);
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const parts = forwarded
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return (parts.at(-1) || "unknown").slice(0, 80);
}

export function rateLimit(
  key: string,
  max: number,
  windowMs: number,
  buckets: Map<string, number[]>,
  now = Date.now(),
): boolean {
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}

export function isProductionEnv(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production" ||
    Boolean(process.env.VERCEL)
  );
}

const WEAK_SECRETS = new Set([
  "",
  "change-me",
  "changeme",
  "password",
  "admin",
  "secret",
  "cron",
  "jobrow",
  "jobrow-preview",
]);

/** Reject placeholder / trivial secrets in production. */
export function isStrongSecret(value: string | null | undefined, minLen = 16): boolean {
  if (!value) return false;
  const v = value.trim();
  if (v.length < minLen) return false;
  if (WEAK_SECRETS.has(v.toLowerCase())) return false;
  return true;
}

const apiBuckets = new Map<string, number[]>();

/** Public JSON API: 120 requests / IP / minute (best-effort per isolate). */
export function publicApiRateOk(request: Request): boolean {
  return rateLimit(`api:${clientIp(request)}`, 120, 60_000, apiBuckets);
}
