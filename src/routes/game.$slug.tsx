import { createFileRoute, notFound } from "@tanstack/react-router";
import { Gamepad2, Keyboard, Maximize2, Play, Star } from "lucide-react";
import { FavoriteButton, ShareButtons, VoteButtons } from "@/components/GameActions";
import { registerPlay } from "@/lib/local";
import { useRef, useState } from "react";

import { AdSlot } from "@/components/AdSlot";
import { GameCard } from "@/components/GameCard";
import { GameModal } from "@/components/GameModal";
import { PortalShell } from "@/components/PortalShell";
import { getGame } from "@/lib/games.functions";
import { categoryName, useLang } from "@/lib/i18n";
import { formatPlays, tileStyle, type Game } from "@/lib/types";

export const Route = createFileRoute("/game/$slug")({
  loader: async ({ params }) => {
    const result = await getGame({ data: { slug: params.slug } });
    if (!result.game) throw notFound();
    return { ...result, game: result.game };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Игра не найдена | GamePortal" }, { name: "robots", content: "noindex" }],
      };
    }
    const { game } = loaderData;
    const title = game.seo_title ?? `${game.title} — играть бесплатно онлайн | GamePortal`;
    const description =
      game.seo_description ??
      (game.description || `Играйте в ${game.title} бесплатно в браузере, без скачивания.`).slice(
        0,
        155,
      );
    const meta = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
    ];
    if (game.thumbnail_url?.startsWith("https://")) {
      meta.push(
        { property: "og:image", content: game.thumbnail_url },
        { name: "twitter:image", content: game.thumbnail_url },
      );
    }
    const ld = {
      "@context": "https://schema.org",
      "@type": "VideoGame",
      name: game.title,
      description,
      genre: game.tags,
      playMode: "SinglePlayer",
      applicationCategory: "Game",
      operatingSystem: "Web browser",
      ...(game.thumbnail_url ? { image: game.thumbnail_url } : {}),
      interactionStatistic: {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/PlayAction",
        userInteractionCount: game.plays,
      },
      ...(game.likes + game.dislikes > 0
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: Math.round((game.likes / (game.likes + game.dislikes)) * 50) / 10,
              bestRating: 5,
              ratingCount: game.likes + game.dislikes,
            },
          }
        : {}),
    };
    return {
      meta: [...meta, { name: "twitter:card", content: "summary_large_image" }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(ld) }],
    };
  },
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center text-muted-foreground">404</div>
  ),
  component: GamePage,
});

function GamePage() {
  const { game, categories, related } = Route.useLoaderData();
  const { lang, t } = useLang();
  const [started, setStarted] = useState(false);
  const [active, setActive] = useState<Game | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const category = categories.find((c) => c.id === game.category_id);
  const likes = game.likes;
  const dislikes = game.dislikes;
  const percent = likes + dislikes > 0 ? Math.round((likes / (likes + dislikes)) * 100) : 0;

  return (
    <PortalShell categories={categories}>
      <AdSlot width={728} height={90} label="AdSense 728×90" className="mb-6" />

      <div className="flex gap-6">
        <div className="min-w-0 flex-1">
          <div
            ref={frameRef}
            className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-[#0b0e14]"
          >
            {started ? (
              <iframe
                src={game.embed_url}
                title={game.title}
                allowFullScreen
                allow="autoplay; fullscreen; gamepad"
                className="size-full border-0"
              />
            ) : (
              <button
                onClick={() => {
                  setStarted(true);
                  registerPlay(game.id);
                }}
                className="group relative size-full"
                aria-label={t("play")}
              >
                {game.thumbnail_url ? (
                  <img
                    src={game.thumbnail_url}
                    alt={game.title}
                    className="size-full object-cover opacity-70"
                  />
                ) : (
                  <div className="size-full opacity-70" style={tileStyle(game.hue)} />
                )}
                <span className="absolute inset-0 grid place-items-center bg-black/40">
                  <span className="flex items-center gap-2.5 rounded-full bg-primary px-7 py-4 text-base font-bold text-primary-foreground shadow-glow transition-transform group-hover:scale-105">
                    <Play className="size-5 fill-current" /> {t("play")}
                  </span>
                </span>
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="mr-auto text-2xl font-extrabold text-foreground">{game.title}</h1>
            <div className="flex items-center gap-1 rounded-full bg-surface-2 px-1">
              <VoteButtons game={game} />
              <FavoriteButton game={game} />
              <ShareButtons game={game} />
            </div>
            <button
              onClick={() => frameRef.current?.requestFullscreen?.()}
              className="flex items-center gap-2 rounded-full bg-surface-2 px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              <Maximize2 className="size-4" /> {t("fullscreen")}
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {category && (
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
                {categoryName(category, lang)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Star className="size-4 fill-current text-chart-3" /> {percent}%
            </span>
            <span>
              {formatPlays(game.plays, lang)} {t("plays")}
            </span>
          </div>

          <section className="mt-6 rounded-2xl border border-border bg-surface p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Keyboard className="size-5 text-primary" /> {t("controlsTitle")}
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {game.controls.map((line) => (
                <li
                  key={line}
                  className="rounded-lg bg-surface-2 px-3 py-2 text-sm text-muted-foreground"
                >
                  {line}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-5 rounded-2xl border border-border bg-surface p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Gamepad2 className="size-5 text-primary" /> {t("aboutTitle")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {game.description}
            </p>
            {game.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {game.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="hidden w-[300px] shrink-0 xl:block">
          <AdSlot width={300} height={250} label="AdSense 300×250" />
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-[22px] font-bold text-foreground">{t("similar")}</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {related.map((g) => (
              <GameCard key={g.id} game={g} categories={categories} onOpen={setActive} />
            ))}
          </div>
        </section>
      )}

      <GameModal game={active} onClose={() => setActive(null)} />
    </PortalShell>
  );
}
