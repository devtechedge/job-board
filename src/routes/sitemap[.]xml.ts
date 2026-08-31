import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { listOpenJobIds } = await import("@/lib/search");
        const jobs = await listOpenJobIds(5000);
        const origin =
          process.env.VITE_SITE_URL ??
          process.env.APP_URL ??
          "https://job-board-devtechedge1.vercel.app";
        const urls = [
          "",
          "/jobs",
          "/companies",
          "/about",
          "/contact",
          "/employers",
          "/legal/terms",
          "/legal/privacy",
          "/legal/sourcing",
          ...jobs.map((job) => `/jobs/${job.id}`),
        ];
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (path) => `  <url><loc>${origin}${path}</loc></url>`,
  )
  .join("\n")}
</urlset>`;
        return new Response(body, {
          headers: { "content-type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});
