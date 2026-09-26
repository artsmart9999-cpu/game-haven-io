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
import { formatPlays, type Game } from "@/lib/types";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { q?: string; sort?: "new" | "top" } => {
    const out: { q?: string; sort?: "new" | "top" } = {};
    if (typeof search["q"] === "string" && search["q"]) out.q = search["q"].slice(0, 80);
    if (search["sort"] === "new" || search["sort"] === "top") out.sort = search["sort"];
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
  const rating = (g: Game) => (g.likes + 1) / (g.likes + g.dislikes + 2);
  const grid =
    sort === "top"
      ? [...filtered].sort((a, b) => rating(b) - rating(a))
      : sort === "new"
        ? filtered
        : [...filtered].sort((a, b) => b.plays - a.plays);
  const popular = [...games].sort((a, b) => b.plays - a.plays).slice(0, 12);
  const newest = games.slice(0, 12);
  const featured = games.find((g) => g.is_featured) ?? popular[0];

  return (
    <PortalShell categories={categories} query={q ?? ""}>
      <AdSlot width={728} height={90} label="AdSense 728×90" className="mb-6" />

      {!query && !sort && featured && (
        <section className="hero-panel relative mb-10 min-h-[390px] overflow-hidden rounded-[30px] border border-white/10 p-7 md:p-11">
          {featured.thumbnail_url && (
            <img
              src={featured.thumbnail_url}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,16,18,.96)_0%,rgba(13,16,18,.78)_42%,rgba(13,16,18,.08)_100%)]" />
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-primary-foreground">
              <span className="size-1.5 animate-pulse rounded-full bg-current" /> Игра недели
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[.92] text-foreground md:text-7xl">
              {featured.title}
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-foreground/70 md:text-base">
              {featured.description}
            </p>
            <div className="mt-5 flex items-center gap-5 text-sm font-bold text-foreground/85">
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
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-black text-primary-foreground transition-transform hover:-translate-y-1"
            >
              <Play className="size-4 fill-current" /> {t("playNow")}
            </button>
          </div>
        </section>
      )}

      {!query && !sort && (
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
            {query
              ? `${t("resultsFor")} “${q}”`
              : sort === "new"
                ? t("newGames")
                : sort === "top"
                  ? t("ratings")
                  : t("allGames")}
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
