import { createFileRoute } from "@tanstack/react-router";

async function handle({ request }: { request: Request }) {
  const { cronSecretOk } = await import("@/lib/admin");
  if (!cronSecretOk(request)) {
    return new Response("unauthorized", { status: 401 });
  }
  const url = new URL(request.url);
  const shard = Number(url.searchParams.get("shard") ?? "0");
  const of = Number(url.searchParams.get("of") ?? "4");
  const { ensureIndex, crawlShard } = await import("@/lib/crawl");
  await ensureIndex();
  const result = await crawlShard(
    Number.isFinite(shard) ? shard : 0,
    Number.isFinite(of) && of > 0 ? of : 4,
  );
  return Response.json(result);
}

export const Route = createFileRoute("/api/cron/crawl")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
    },
  },
});
