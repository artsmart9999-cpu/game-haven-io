import { Play } from "lucide-react";

import { categoryName, useLang } from "@/lib/i18n";
import { tileStyle, type Category, type Game } from "@/lib/types";

export function GameCard({
  game,
  categories,
  onOpen,
  className,
}: {
  game: Game;
  categories: Category[];
  onOpen: (game: Game) => void;
  className?: string;
}) {
  const { lang } = useLang();
  const category = categories.find((c) => c.id === game.category_id);

  return (
    <button
      type="button"
      onClick={() => onOpen(game)}
      className={`group block overflow-hidden rounded-2xl border border-border bg-surface text-left transition-all duration-200 hover:-translate-y-1.5 hover:scale-[1.02] hover:border-primary hover:shadow-card ${className ?? ""}`}
    >
      <div className="relative aspect-video w-full overflow-hidden">
        {game.thumbnail_url ? (
          <img
            src={game.thumbnail_url}
            alt={game.title}
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <div
            className="flex size-full items-center justify-center p-3"
            style={tileStyle(game.hue)}
          >
            <span className="font-display text-center text-base font-extrabold leading-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]">
              {game.title}
            </span>
          </div>
        )}
        <span className="absolute inset-0 grid place-items-center bg-black/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="grid size-12 place-items-center rounded-full bg-primary shadow-glow">
            <Play className="size-5 fill-current text-primary-foreground" />
          </span>
        </span>
      </div>
      <div className="px-3.5 pb-3.5 pt-3">
        <h3 className="truncate text-[15px] font-semibold text-foreground">{game.title}</h3>
        {category && (
          <span className="mt-1.5 inline-block rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            {categoryName(category, lang)}
          </span>
        )}
      </div>
    </button>
  );
}
