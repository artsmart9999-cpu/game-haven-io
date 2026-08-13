import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Expand, Play, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react";
import { useRef, useState } from "react";

import { AdSlot } from "@/components/AdSlot";
import { GameCard } from "@/components/GameCard";
import { PortalShell } from "@/components/PortalShell";
import { gameBySlug, games, tileStyle } from "@/lib/games";

export const Route = createFileRoute("/game/$slug")({
  loader: ({ params }) => {
    const game = gameBySlug(params.slug);
    if (!game) throw notFound();
    return { game };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Game unavailable — PlayzoArena" }, { name: "robots", content: "noindex" }] };
    }
    const { game } = loaderData;
    const title = `${game.title} — Play Free Online | PlayzoArena`;
    return {
      meta: [
        { title },
        { name: "description", content: game.description },
        { property: "og:title", content: title },
        { property: "og:description", content: game.description },
      ],
    };
  },
  component: GamePage,
});

function GamePage() {
  const { game } = Route.useLoaderData();
  const frameWrap = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [likes, setLikes] = useState(1284);

  const related = games.filter((g) => g.slug !== game.slug).slice(0, 10);

  function toggleFullscreen() {
    const el = frameWrap.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen();
  }

  function castVote(next: "up" | "down") {
    setVote((prev) => {
      if (prev === next) return prev;
      setLikes((l) => l + (next === "up" ? 1 : prev === "up" ? -1 : 0));
      return next;
    });
  }

  return (
    <PortalShell>
      <div className="flex gap-6">
        <div className="min-w-0 flex-1">
          <div
            ref={frameWrap}
            className="relative aspect-video w-full overflow-hidden rounded-xl bg-surface shadow-card"
          >
            {started ? (
              <iframe
                src={game.embedUrl}
                title={game.title}
                className="h-full w-full border-0"
                allow="autoplay; fullscreen; gamepad; microphone *; clipboard-write"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <button
                onClick={() => setStarted(true)}
                className="group flex h-full w-full flex-col items-center justify-center gap-4"
                style={tileStyle(game.hue)}
              >
                <span className="grid size-20 place-items-center rounded-full bg-primary shadow-glow transition-transform group-hover:scale-110">
                  <Play className="size-9 fill-current text-primary-foreground" />
                </span>
                <span className="font-display text-2xl font-extrabold text-primary-foreground">
                  Play {game.title}
                </span>
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-surface px-3 py-2">
            <h1 className="mr-auto text-lg font-extrabold text-foreground">{game.title}</h1>

            <button
              onClick={() => castVote("up")}
              aria-label="Like"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-surface-2 ${vote === "up" ? "text-primary" : "text-muted-foreground"}`}
            >
              <ThumbsUp className="size-4" /> {likes.toLocaleString("en-US")}
            </button>
            <button
              onClick={() => castVote("down")}
              aria-label="Dislike"
              className={`rounded-lg px-3 py-2 transition-colors hover:bg-surface-2 ${vote === "down" ? "text-primary" : "text-muted-foreground"}`}
            >
              <ThumbsDown className="size-4" />
            </button>
            <button
              onClick={() => setStarted(false)}
              aria-label="Restart game"
              className="rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-surface-2"
            >
              <RotateCcw className="size-4" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-transform hover:scale-105"
            >
              <Expand className="size-4" /> Fullscreen
            </button>
          </div>

          <section className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-surface p-4">
              <h2 className="text-base font-extrabold text-foreground">Controls</h2>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {game.controls.map((c) => (
                  <li key={c} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-surface p-4">
              <h2 className="text-base font-extrabold text-foreground">About {game.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{game.description}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Play {game.title} for free in your browser — no download, no install. Works on desktop
                and mobile.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {game.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-muted-foreground"
                  >
                    #{t}
                  </span>
                ))}
                <Link
                  to="/category/$slug"
                  params={{ slug: game.category }}
                  className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary"
                >
                  {game.category}
                </Link>
              </div>
            </div>
          </section>

          <AdSlot width={728} height={90} label="AdSense 728×90" className="mt-6" />

          <h2 className="mb-3 mt-6 text-xl font-extrabold text-foreground">You may also like</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {related.map((g) => (
              <GameCard key={g.slug} game={g} />
            ))}
          </div>
        </div>

        <aside className="hidden w-[300px] shrink-0 space-y-4 xl:block">
          <AdSlot width={300} height={250} label="AdSense 300×250" />
          <AdSlot width={300} height={250} label="AdSense 300×250" />
        </aside>
      </div>
    </PortalShell>
  );
}
