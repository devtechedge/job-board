export const BOARD_TOKEN_RE = /^[a-zA-Z0-9._-]{1,80}$/;
export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isPrivateHost(host: string): boolean {
  const h = host.replace(/^\[|\]$/g, "").toLowerCase();
  if (!h) return true;
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h === "::1") {
    return true;
  }
  if (h.includes(":")) {
    if (h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80")) return true;
  }
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    if (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 192 && b === 168) ||
      (a === 172 && b >= 16 && b <= 31) ||
      a === 100
    ) {
      return true;
    }
  }
  return false;
}

export function publicHttpsUrl(value: string, max = 500): string | null {
  if (!value || value.length > max) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
    if (isPrivateHost(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

const ATS_FETCH_HOSTS = new Set([
  "boards-api.greenhouse.io",
  "boards.greenhouse.io",
  "api.ashbyhq.com",
  "api.lever.co",
  "apply.workable.com",
]);

export function assertAtsFetchUrl(url: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("blocked url");
  }
  if (parsed.protocol !== "https:") throw new Error("blocked url");
  if (parsed.username || parsed.password) throw new Error("blocked url");
  if (isPrivateHost(parsed.hostname)) throw new Error("blocked url");
  if (!ATS_FETCH_HOSTS.has(parsed.hostname.toLowerCase())) throw new Error("blocked url");
  return parsed;
}

export function jsonForScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/>/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;")
    .replace(/'/g, "\u0026apos;");
}
