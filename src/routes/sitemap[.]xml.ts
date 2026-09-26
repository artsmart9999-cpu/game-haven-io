import { createFileRoute } from "@tanstack/react-router";

import { loadPortal } from "@/lib/games.server";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const { categories, games } = await loadPortal();
        const urls = [
          `${origin}/`,
          ...categories.map((c) => `${origin}/category/${c.slug}`),
          ...games.map((g) => `${origin}/game/${g.slug}`),
        ];
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>`;
        return new Response(body, {
          headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" },
        });
      },
    },
  },
});
