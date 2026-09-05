import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/expired")({
  validateSearch: (search: Record<string, unknown>) => {
    const raw = search.page;
    const page =
      typeof raw === "number"
        ? raw
        : typeof raw === "string" && raw
          ? Number(raw)
          : 1;
    return { page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1 };
  },
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/closed",
      search: { page: search.page },
      replace: true,
    });
  },
});
