import { createFileRoute } from "@tanstack/react-router";
import { Flame, LayoutGrid, Play, Sparkles, Star } from "lucide-react";
import { useState } from "react";

import { AdSlot } from "@/components/AdSlot";
import { GameCard } from "@/components/GameCard";
import { GameCarousel } from "@/components/GameCarousel";
import { GameModal } from "@/components/GameModal";
import { PortalShell } from "@/components/PortalShell";
import { getPortal } from "@/lib/games.functions";
import { useLang } from "@/lib/i18n";
import { formatPlays, tileStyle, type Game } from "@/lib/types";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { q?: string; sort?: "new" } => {
    const out: { q?: string; sort?: "new" } = {};
    if (typeof search["q"] === "string" && search["q"]) out.q = search["q"].slice(0, 80);
    if (search["sort"] === "new") out.sort = "new";
    return out;
  },
  loader: () => getPortal(),
  head: () => ({
    meta: [
      { title: "GamePortal — бесплатные HTML5 игры онлайн без скачивания" },
      {
        name: "description",
        content:
          "Играйте в бесплатные HTML5 игры прямо в браузере: экшен, гонки, головоломки, .io и спорт. Без скачивания и установки.",
      },
      { property: "og:title", content: "GamePortal — бесплатные HTML5 игры онлайн" },
      {
        property: "og:description",
        content: "Мгновенный запуск браузерных игр: экшен, гонки, головоломки, .io и другие.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { categories, games } = Route.useLoaderData();
  const { q, sort } = Route.useSearch();
  const { lang, t } = useLang();
  const [active, setActive] = useState<Game | null>(null);

  const query = (q ?? "").trim().toLowerCase();
  const filtered = games.filter(
    (g) =>
      !query ||
      g.title.toLowerCase().includes(query) ||
      g.tags.some((tag) => tag.toLowerCase().includes(query)),
  );
  const grid = sort === "new" ? filtered : filtered;
  const popular = [...games].sort((a, b) => b.plays - a.plays).slice(0, 12);
  const newest = games.slice(0, 12);
  const featured = games.find((g) => g.is_featured) ?? popular[0];

  return (
    <PortalShell categories={categories} query={q ?? ""}>
      <AdSlot width={728} height={90} label="AdSense 728×90" className="mb-6" />

      {!query && featured && (
        <section className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-hero p-6 md:p-10">
          <div className="relative z-10 max-w-xl">
            <span className="inline-block rounded-full bg-black/25 px-3 py-1 text-xs font-bold uppercase tracking-widest text-foreground">
              {t("featured")}
            </span>
            <h1 className="mt-3 text-3xl font-extrabold text-foreground md:text-5xl">
              {featured.title}
            </h1>
            <p className="mt-3 text-sm text-foreground/85 md:text-base">{featured.description}</p>
            <div className="mt-4 flex items-center gap-5 text-sm text-foreground/85">
              <span className="flex items-center gap-1.5">
                <Star className="size-4 fill-current text-chart-3" />
                {featured.likes + featured.dislikes > 0
                  ? Math.round((featured.likes / (featured.likes + featured.dislikes)) * 100)
                  : 0}
                %
              </span>
              <span>
                {formatPlays(featured.plays, lang)} {t("plays")}
              </span>
            </div>
            <button
              onClick={() => setActive(featured)}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-105"
            >
              <Play className="size-4 fill-current" /> {t("playNow")}
            </button>
          </div>
          <div
            className="absolute -right-10 top-0 hidden h-full w-1/2 rotate-3 rounded-2xl opacity-60 md:block"
            style={tileStyle(featured.hue)}
          />
        </section>
      )}

      {!query && (
        <>
          <GameCarousel
            title={t("popularGames")}
            icon={<Flame className="size-5 text-chart-2" />}
            games={popular}
            categories={categories}
            onOpen={setActive}
          />
          <GameCarousel
            title={t("newGames")}
            icon={<Sparkles className="size-5 text-chart-3" />}
            games={newest}
            categories={categories}
            onOpen={setActive}
          />
        </>
      )}

      <div className="flex gap-6">
        <section className="min-w-0 flex-1">
          <h2 className="mb-4 flex items-center gap-2.5 text-[22px] font-bold text-foreground">
            <LayoutGrid className="size-5 text-primary" />
            {query ? `${t("resultsFor")} “${q}”` : sort === "new" ? t("newGames") : t("allGames")}
          </h2>

          {grid.length === 0 ? (
            <p className="rounded-2xl bg-surface p-8 text-center text-sm text-muted-foreground">
              {t("nothingFound")}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {grid.map((g) => (
                <GameCard key={g.id} game={g} categories={categories} onOpen={setActive} />
              ))}
            </div>
          )}
        </section>

        <aside className="hidden w-[300px] shrink-0 xl:block">
          <AdSlot width={300} height={250} label="AdSense 300×250" />
        </aside>
      </div>

      <GameModal game={active} onClose={() => setActive(null)} />
    </PortalShell>
  );
}
