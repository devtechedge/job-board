import { publicHttpsUrl } from "./safe.ts";
import { rateLimit } from "./security.ts";

export type DeskKind = "write" | "board_request" | "bound_pass" | "placement";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN = /^[a-zA-Z0-9._-]{2,80}$/;
const ATS = new Set(["greenhouse", "ashby", "lever", "workable"]);

function clip(value: unknown, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

export type DeskPayload = {
  kind: DeskKind;
  name: string;
  email: string;
  topic: string;
  body: string;
  listingUrl: string;
  company: string;
  ats: string;
  boardToken: string;
  careersUrl: string;
  website: string;
  country: string;
  fax: string;
};

export function parseDeskPayload(input: unknown): DeskPayload | { error: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { error: "Empty note" };
  const raw = input as Record<string, unknown>;
  const kind = clip(raw.kind, 32);
  if (kind !== "write" && kind !== "board_request" && kind !== "bound_pass" && kind !== "placement") {
    return { error: "Unknown desk queue" };
  }
  return {
    kind,
    name: clip(raw.name, 120),
    email: clip(raw.email, 200).toLowerCase(),
    topic: clip(raw.topic, 80),
    body: clip(raw.body, 4000),
    listingUrl: clip(raw.listingUrl, 500),
    company: clip(raw.company, 160),
    ats: clip(raw.ats, 32).toLowerCase(),
    boardToken: clip(raw.boardToken, 80),
    careersUrl: clip(raw.careersUrl, 500),
    website: clip(raw.website, 500),
    country: clip(raw.country, 40),
    fax: clip(raw.fax, 200),
  };
}

export function validateDeskPayload(note: DeskPayload): string | null {
  if (!EMAIL.test(note.email)) return "Need a real email so we can reply.";
  if (note.kind === "write") {
    if (note.body.length < 12) return "Write at least a sentence.";
    if (note.listingUrl && !publicHttpsUrl(note.listingUrl)) return "Listing URL must be https.";
    return null;
  }
  if (note.kind === "bound_pass") {
    return null;
  }
  if (note.kind === "placement") {
    if (note.company.length < 2) return "Company name is required.";
    if (!publicHttpsUrl(note.listingUrl)) return "Need the Jobrow or employer ATS https URL to pin.";
    return null;
  }
  if (note.company.length < 2) return "Company name is required.";
  if (!ATS.has(note.ats)) return "Pick Greenhouse, Ashby, Lever, or another supported ATS.";
  if (!TOKEN.test(note.boardToken)) return "Board token looks off. Use the public board slug, not a login.";
  if (!publicHttpsUrl(note.careersUrl)) return "Careers URL must be https.";
  if (note.website && !publicHttpsUrl(note.website)) return "Website must be https.";
  return null;
}

const buckets = new Map<string, number[]>();

export function deskRateOk(ip: string, now = Date.now()): boolean {
  return rateLimit(ip, 6, 10 * 60 * 1000, buckets, now);
}

export async function saveDeskNote(note: DeskPayload): Promise<void> {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  await sql.query(
    `insert into desk_notes (
      id, kind, name, email, topic, body, listing_url, company, ats, board_token,
      careers_url, website, country
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [
      crypto.randomUUID(),
      note.kind,
      note.name || null,
      note.email,
      note.topic || null,
      note.body || null,
      publicHttpsUrl(note.listingUrl),
      note.company || null,
      note.ats || null,
      note.boardToken || null,
      publicHttpsUrl(note.careersUrl),
      publicHttpsUrl(note.website),
      note.country || null,
    ],
  );
}
