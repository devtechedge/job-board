import { createFileRoute } from "@tanstack/react-router";
import type { RetentionResult } from "@/lib/crawl";

async function handle({ request }: { request: Request }) {
  const { cronSecretOk } = await import("@/lib/admin");
  if (!cronSecretOk(request)) {
    return new Response("unauthorized", { status: 401 });
  }
  const url = new URL(request.url);
  const shard = Number(url.searchParams.get("shard") ?? "0");
  const of = Number(url.searchParams.get("of") ?? "4");
  const { ensureIndex, crawlShard, pruneClosedJobs } = await import("@/lib/crawl");
  const boot = await ensureIndex();

  // Reclaiming space must not be able to take the crawl down with it. If the
  // project is already over its storage allowance the prune can itself be
  // rejected, and a frozen index is a far worse outcome than an unreclaimed
  // closed ledger - so report the failure instead of throwing it.
  const retention: RetentionResult & { error?: string } = await pruneClosedJobs().catch(
    (error: unknown) => ({
      trimmed: 0,
      deleted: 0,
      error: error instanceof Error ? error.message.slice(0, 200) : "prune failed",
    }),
  );

  // `?boot=1` is the explicit bootstrap path: seed, reclassify and reclaim
  // without waiting on the schedule and without running a shard crawl.
  if (url.searchParams.get("boot") === "1") {
    return Response.json({ boot, retention });
  }

  const result = await crawlShard(
    Number.isFinite(shard) ? shard : 0,
    Number.isFinite(of) && of > 0 ? of : 4,
  );
  return Response.json({ ...result, retention });
}

export const Route = createFileRoute("/api/cron/crawl")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
    },
  },
});
