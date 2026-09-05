import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/expired")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        url.pathname = "/api/closed";
        return Response.redirect(url.toString(), 308);
      },
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
          },
        }),
    },
  },
});
