import { isPrivateHost, publicHttpsUrl } from "./safe.ts";

export function hostFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    if (!host || isPrivateHost(host)) return null;
    return host;
  } catch {
    return null;
  }
}

/** Company site icon via Google's public favicon endpoint. Initials if it fails. */
export function companyLogoSrc(opts: {
  logoUrl?: string | null;
  website?: string | null;
}): string | null {
  if (opts.logoUrl && publicHttpsUrl(opts.logoUrl)) return opts.logoUrl;
  const host = hostFromUrl(opts.website);
  if (!host) return null;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
}

export function companyInitials(name: string): string {
  const parts = name
    .replace(/[^A-Za-z0-9 ]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
