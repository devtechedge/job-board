import { AGGREGATOR_HOSTS, ATS_HOST_SUFFIXES } from "./types.ts";
import { hostOf } from "../utils.ts";

function apex(host: string): string {
  return host.toLowerCase().replace(/^www\./, "");
}

function hostMatches(host: string, suffix: string): boolean {
  const h = apex(host);
  const s = apex(suffix);
  return h === s || h.endsWith(`.${s}`);
}

/** Greenhouse (Block) still emits http:// on some boards. We only store https. */
export function canonicalizeApplyUrl(applyUrl: string): string {
  const trimmed = applyUrl.trim();
  if (trimmed.toLowerCase().startsWith("http://")) {
    return `https://${trimmed.slice("http://".length)}`;
  }
  return trimmed;
}

export function isAllowedApplyUrl(
  applyUrl: string,
  extraHosts: Array<string | null | undefined> = [],
): boolean {
  if (!applyUrl) return false;
  const url = canonicalizeApplyUrl(applyUrl);
  if (!url.startsWith("https://")) return false;
  const host = hostOf(url);
  if (!host) return false;
  if (AGGREGATOR_HOSTS.some((h) => hostMatches(host, h))) return false;
  if (ATS_HOST_SUFFIXES.some((h) => hostMatches(host, h))) return true;
  const extras = extraHosts
    .map((item) => (item && item.includes("://") ? hostOf(item) : item?.toLowerCase()))
    .filter((item): item is string => Boolean(item));
  return extras.some((h) => hostMatches(host, h));
}
