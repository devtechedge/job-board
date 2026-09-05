import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const { dbSource, getSql } = await import("@/lib/db");
        const sql = await getSql();
        const [{ jobs }] = await sql.query<{ jobs: number }>(
          `select count(*)::int as jobs from jobs where status = 'open'`,
        );
        const [{ pending }] = await sql.query<{ pending: number }>(
          `select count(*)::int as pending from companies where enabled = true and last_ok_at is null`,
        );
        const [{ stale }] = await sql.query<{ stale: number }>(
          `select count(*)::int as stale from companies
           where enabled = true
             and (last_ok_at is null or last_ok_at < now() - interval '36 hours')`,
        );
        const [{ lastOkAt }] = await sql.query<{ lastOkAt: Date | null }>(
          `select max(last_ok_at) as "lastOkAt" from companies where enabled = true`,
        );
        return Response.json({
          ok: true,
          db: dbSource,
          openJobs: jobs,
          pendingBoards: pending,
          staleBoards: stale,
          lastOkAt: lastOkAt ? new Date(lastOkAt).toISOString() : null,
        });
      },
    },
  },
});
