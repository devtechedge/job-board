import { rateLimit, secretEqual } from "@/lib/security";

const adminAttempts = new Map<string, number[]>();

export function previewAdminFallback(): string | null {
  if (process.env.DATABASE_URL) return null;
  if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") return null;
  return process.env.ADMIN_PASSWORD?.trim() ? null : "jobrow-preview";
}

export function expectedAdminPassword(): string | null {
  const fromEnv = process.env.ADMIN_PASSWORD?.trim();
  if (fromEnv) return fromEnv;
  return previewAdminFallback();
}

export function adminPasswordOk(candidate: string | null | undefined, ip = "unknown"): boolean {
  if (!rateLimit(`admin:${ip}`, 8, 10 * 60 * 1000, adminAttempts)) return false;
  const expected = expectedAdminPassword();
  if (!expected || !candidate) return false;
  return secretEqual(candidate, expected);
}

export function cronSecretOk(request: Request): boolean {
  const expected = process.env.CRON_SECRET?.trim();
  const header = request.headers.get("authorization") ?? "";
  const bearer = header.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : "";
  if (!expected) {
    return !process.env.DATABASE_URL && process.env.NODE_ENV !== "production";
  }
  if (!bearer) return false;
  return secretEqual(bearer, expected);
}
