import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/desk")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { deskRateOk, parseDeskPayload, saveDeskNote, validateDeskPayload } =
          await import("@/lib/desk");
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          "unknown";
        if (!deskRateOk(ip)) {
          return Response.json({ ok: false, error: "Too many notes from this network." }, { status: 429 });
        }
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, error: "Unreadable note." }, { status: 400 });
        }
        const parsed = parseDeskPayload(body);
        if ("error" in parsed) {
          return Response.json({ ok: false, error: parsed.error }, { status: 400 });
        }
        // Honeypot: look successful, store nothing.
        if (parsed.fax) {
          return Response.json({ ok: true });
        }
        const invalid = validateDeskPayload(parsed);
        if (invalid) {
          return Response.json({ ok: false, error: invalid }, { status: 400 });
        }
        try {
          await saveDeskNote(parsed);
        } catch (error) {
          const message = error instanceof Error ? error.message : "save failed";
          return Response.json({ ok: false, error: message.slice(0, 200) }, { status: 500 });
        }
        return Response.json({ ok: true });
      },
    },
  },
});
