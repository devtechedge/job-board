import { clientIp, isProductionEnv, isStrongSecret, rateLimit, secretEqual } from "@/lib/security";

const adminAttempts = new Map<string, number[]>();

export function previewAdminFallback(): string | null {
  if (process.env.DATABASE_URL) return null;
  if (isProductionEnv()) return null;
  return process.env.ADMIN_PASSWORD?.trim() ? null : "jobrow-preview";
}

export function expectedAdminPassword(): string | null {
  const fromEnv = process.env.ADMIN_PASSWORD?.trim();
  if (fromEnv) {
    if (isProductionEnv() && !isStrongSecret(fromEnv, 16)) return null;
    return fromEnv;
  }
  return previewAdminFallback();
}

export function adminPasswordOk(candidate: string | null | undefined, ip = "unknown"): boolean {
  if (!rateLimit(`admin:${ip}`, 8, 10 * 60 * 1000, adminAttempts)) return false;
  const expected = expectedAdminPassword();
  if (!expected || !candidate) return false;
  return secretEqual(candidate, expected);
}

/** Prefer this in server fns so rate limits key off the real client IP. */
export async function assertAdminPassword(candidate: string | null | undefined): Promise<void> {
  let ip = "unknown";
  try {
    const { getRequest } = await import("@tanstack/react-start/server");
    const request = getRequest();
    if (request) ip = clientIp(request);
  } catch {
    /* non-request context */
  }
  if (!adminPasswordOk(candidate, ip)) throw new Error("Wrong password");
}

export function cronSecretOk(request: Request): boolean {
  const expected = process.env.CRON_SECRET?.trim();
  const bearerHeader = request.headers.get("authorization") ?? "";
  const bearer = bearerHeader.toLowerCase().startsWith("bearer ")
    ? bearerHeader.slice(7).trim()
    : "";

  // Fail closed whenever a real DB or production host is in play.
  if (!expected || (isProductionEnv() && !isStrongSecret(expected, 16))) {
    if (isProductionEnv() || process.env.DATABASE_URL) return false;
    return process.env.NODE_ENV !== "production";
  }
  if (!bearer) return false;
  return secretEqual(bearer, expected);
}
