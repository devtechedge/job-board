import { timingSafeEqual } from "node:crypto";

export function previewAdminFallback(): string | null {
  if (process.env.DATABASE_URL) return null;
  return "jobrow-preview";
}

export function expectedAdminPassword(): string | null {
  const fromEnv = process.env.ADMIN_PASSWORD?.trim();
  if (fromEnv) return fromEnv;
  return previewAdminFallback();
}

export function adminPasswordOk(candidate: string | null | undefined): boolean {
  const expected = expectedAdminPassword();
  if (!expected || !candidate) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function cronSecretOk(request: Request): boolean {
  const expected = process.env.CRON_SECRET?.trim();
  const header = request.headers.get("authorization") ?? "";
  const bearer = header.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : "";
  const urlSecret = new URL(request.url).searchParams.get("secret") ?? "";
  const given = bearer || urlSecret;
  if (!expected) {
    // Preview / local: allow when Neon is not attached.
    return !process.env.DATABASE_URL;
  }
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
