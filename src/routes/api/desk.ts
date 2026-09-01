import { createFileRoute } from "@tanstack/react-router";
import { clientIp } from "@/lib/security";

const MAX_BODY = 16_384;

export const Route = createFileRoute("/api/desk")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { deskRateOk, parseDeskPayload, saveDeskNote, validateDeskPayload } =
          await import("@/lib/desk");
        const ip = clientIp(request);
        if (!deskRateOk(ip)) {
          return Response.json({ ok: false, error: "Too many notes from this network." }, { status: 429 });
        }
        const length = Number(request.headers.get("content-length") ?? "0");
        if (Number.isFinite(length) && length > MAX_BODY) {
          return Response.json({ ok: false, error: "Note too large." }, { status: 413 });
        }
        let rawText: string;
        try {
          rawText = await request.text();
        } catch {
          return Response.json({ ok: false, error: "Unreadable note." }, { status: 400 });
        }
        if (rawText.length > MAX_BODY) {
          return Response.json({ ok: false, error: "Note too large." }, { status: 413 });
        }
        let body: unknown;
        try {
          body = JSON.parse(rawText) as unknown;
        } catch {
          return Response.json({ ok: false, error: "Unreadable note." }, { status: 400 });
        }
        const parsed = parseDeskPayload(body);
        if ("error" in parsed) {
          return Response.json({ ok: false, error: parsed.error }, { status: 400 });
        }
        if (parsed.fax) {
          return Response.json({ ok: true });
        }
        const invalid = validateDeskPayload(parsed);
        if (invalid) {
          return Response.json({ ok: false, error: invalid }, { status: 400 });
        }
        try {
          await saveDeskNote(parsed);
        } catch {
          return Response.json({ ok: false, error: "Could not file the note." }, { status: 500 });
        }
        return Response.json({ ok: true });
      },
    },
  },
});
