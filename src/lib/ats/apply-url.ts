import { AGGREGATOR_HOSTS, ATS_HOST_SUFFIXES } from "./types.ts";
import { hostOf } from "../utils.ts";

function hostMatches(host: string, suffix: string): boolean {
  return host === suffix || host.endsWith(`.${suffix}`);
}

export function isAllowedApplyUrl(
  applyUrl: string,
  extraHosts: Array<string | null | undefined> = [],
): boolean {
  if (!applyUrl || !applyUrl.startsWith("https://")) return false;
  const host = hostOf(applyUrl);
  if (!host) return false;
  if (AGGREGATOR_HOSTS.some((h) => hostMatches(host, h))) return false;
  if (ATS_HOST_SUFFIXES.some((h) => hostMatches(host, h))) return true;
  const extras = extraHosts
    .map((item) => (item && item.includes("://") ? hostOf(item) : item?.toLowerCase()))
    .filter((item): item is string => Boolean(item));
  return extras.some((h) => hostMatches(host, h));
}
