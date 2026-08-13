import { Link } from "@tanstack/react-router";
import { Play, Star } from "lucide-react";

import { tileStyle, type Game } from "@/lib/games";

export function GameCard({ game, large = false }: { game: Game; large?: boolean }) {
  return (
    <Link
      to="/game/$slug"
      params={{ slug: game.slug }}
      className={`group relative block overflow-hidden rounded-xl bg-surface shadow-card transition-transform duration-200 hover:-translate-y-1 hover:shadow-glow ${
        large ? "col-span-2 row-span-2" : ""
      }`}
    >
      <div
        className="aspect-square w-full transition-transform duration-300 group-hover:scale-105"
        style={tileStyle(game.hue)}
      >
        <div className="flex h-full w-full items-center justify-center p-3">
          <span
            className={`font-display text-center font-extrabold leading-tight text-primary-foreground drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] ${
              large ? "text-3xl" : "text-lg"
            }`}
          >
            {game.title}
          </span>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background via-background/40 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="p-3">
          <p className="truncate text-sm font-semibold text-foreground">{game.title}</p>
          <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <Star className="size-3 fill-current text-primary-glow" />
            {game.rating}% · {game.plays}
          </p>
        </div>
      </div>

      <span className="absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-primary opacity-0 shadow-glow transition-opacity duration-200 group-hover:opacity-100">
        <Play className="size-4 fill-current text-primary-foreground" />
      </span>
    </Link>
  );
}
