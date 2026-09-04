import { createFileRoute } from "@tanstack/react-router";
import { sitePublicOrigin, xmlEscape } from "@/lib/safe";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { listOpenJobIds } = await import("@/lib/search");
        const jobs = await listOpenJobIds(5000);
        const origin = sitePublicOrigin();
        const urls = [
          "",
          "/jobs",
          "/expired",
          "/companies",
          "/about",
          "/contact",
          "/employers",
          "/pricing",
          "/placements",
          "/legal/terms",
          "/legal/privacy",
          "/legal/sourcing",
          ...jobs.map((job) => `/jobs/${xmlEscape(job.id)}`),
        ];
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((path) => `  <url><loc>${xmlEscape(origin)}${path}</loc></url>`).join("\n")}
</urlset>`;
        return new Response(body, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
