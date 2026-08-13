import { createFileRoute, Link } from "@tanstack/react-router";
import { Play, Star } from "lucide-react";

import { AdSlot } from "@/components/AdSlot";
import { GameCard } from "@/components/GameCard";
import { PortalShell } from "@/components/PortalShell";
import { featuredGame, games, tileStyle } from "@/lib/games";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
    sort: search.sort === "new" ? ("new" as const) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "PlayzoArena — Free Online HTML5 Games, No Download" },
      {
        name: "description",
        content:
          "Play hundreds of free HTML5 games in your browser: action, racing, puzzle, .io and 2-player games. No download, no install.",
      },
      { property: "og:title", content: "PlayzoArena — Free Online HTML5 Games" },
      {
        property: "og:description",
        content: "Instant-play browser games: action, racing, puzzle, .io and more.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { q, sort } = Route.useSearch();
  const query = q.trim().toLowerCase();

  const filtered = games.filter(
    (g) =>
      !query ||
      g.title.toLowerCase().includes(query) ||
      g.category.includes(query) ||
      g.tags.some((t) => t.includes(query)),
  );
  const list = sort === "new" ? [...filtered].reverse() : filtered;

  return (
    <PortalShell>
      <AdSlot width={728} height={90} label="AdSense 728×90" className="mb-5" />

      {!query && (
        <section className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-hero p-6 md:p-10">
          <div className="relative z-10 max-w-xl">
            <span className="inline-block rounded-full bg-background/40 px-3 py-1 text-xs font-bold uppercase tracking-widest text-foreground">
              Featured game
            </span>
            <h1 className="mt-3 text-3xl font-extrabold text-foreground md:text-5xl">
              {featuredGame.title}
            </h1>
            <p className="mt-3 text-sm text-foreground/80 md:text-base">{featuredGame.description}</p>
            <div className="mt-4 flex items-center gap-4 text-sm text-foreground/80">
              <span className="flex items-center gap-1">
                <Star className="size-4 fill-current text-primary-glow" /> {featuredGame.rating}%
              </span>
              <span>{featuredGame.plays} plays</span>
            </div>
            <Link
              to="/game/$slug"
              params={{ slug: featuredGame.slug }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-105"
            >
              <Play className="size-4 fill-current" /> Play now
            </Link>
          </div>
          <div
            className="absolute -right-10 top-0 hidden h-full w-1/2 rotate-3 rounded-2xl opacity-70 md:block"
            style={tileStyle(featuredGame.hue)}
          />
        </section>
      )}

      <div className="flex gap-6">
        <div className="min-w-0 flex-1">
          <h2 className="mb-3 text-xl font-extrabold text-foreground">
            {query ? `Results for “${q}”` : sort === "new" ? "New games" : "Popular games"}
          </h2>

          {list.length === 0 ? (
            <p className="rounded-xl bg-surface p-8 text-center text-sm text-muted-foreground">
              No games match your search yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {list.map((g, i) => (
                <GameCard key={g.slug} game={g} large={!query && i === 0} />
              ))}
            </div>
          )}
        </div>

        <aside className="hidden w-[300px] shrink-0 xl:block">
          <AdSlot width={300} height={250} label="AdSense 300×250" />
        </aside>
      </div>
    </PortalShell>
  );
}
