import { createFileRoute } from "@tanstack/react-router";
import { sitePublicOrigin, xmlEscape } from "@/lib/safe";

function lastmodXml(value: unknown): string {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(d.getTime())) return "";
  return `<lastmod>${d.toISOString()}</lastmod>`;
}

function urlXml(origin: string, path: string, lastmod: unknown = null): string {
  const mod = lastmodXml(lastmod);
  return `  <url><loc>${xmlEscape(origin)}${path}</loc>${mod}</url>`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { listOpenJobIds, listEnabledCompaniesForSitemap, homeDigest } = await import(
          "@/lib/search"
        );
        const [jobs, companies, digest] = await Promise.all([
          listOpenJobIds(5000),
          listEnabledCompaniesForSitemap(),
          homeDigest().catch(() => null),
        ]);
        const origin = sitePublicOrigin();
        const registerLastmod = digest?.lastOkAt ?? null;
        const staticPaths = [
          "",
          "/jobs",
          "/closed",
          "/companies",
          "/about",
          "/contact",
          "/employers",
          "/pricing",
          "/placements",
          "/legal/terms",
          "/legal/privacy",
          "/legal/sourcing",
        ];
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPaths.map((path) => urlXml(origin, path, registerLastmod)).join("\n")}
${companies.map((c) => urlXml(origin, `/companies/${xmlEscape(c.slug)}`, c.last_ok_at)).join("\n")}
${jobs.map((job) => urlXml(origin, `/jobs/${xmlEscape(job.id)}`, job.last_seen_at)).join("\n")}
</urlset>`;
        return new Response(body, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            // Crawl updates up to several times a day; don't cache the map all day.
            "cache-control": "public, max-age=900",
          },
        });
      },
    },
  },
});
