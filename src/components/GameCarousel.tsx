import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, type ReactNode } from "react";

import { GameCard } from "./GameCard";
import type { Category, Game } from "@/lib/types";

export function GameCarousel({
  title,
  icon,
  games,
  categories,
  onOpen,
}: {
  title: string;
  icon?: ReactNode;
  games: Game[];
  categories: Category[];
  onOpen: (game: Game) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (delta: number) => {
    trackRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  if (games.length === 0) return null;

  return (
    <section className="my-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2.5 text-[22px] font-bold text-foreground">
          {icon}
          {title}
        </h2>
        <div className="flex gap-2">
          {[
            { dir: -260, Icon: ChevronLeft, label: "prev" },
            { dir: 260, Icon: ChevronRight, label: "next" },
          ].map(({ dir, Icon, label }) => (
            <button
              key={label}
              onClick={() => scrollBy(dir)}
              aria-label={label}
              className="grid size-9 place-items-center rounded-full bg-surface-2 text-muted-foreground transition-colors hover:bg-input hover:text-foreground"
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex gap-[18px] overflow-x-auto scroll-smooth px-1 pb-5 pt-2 scrollbar-thin"
      >
        {games.map((g) => (
          <GameCard
            key={g.id}
            game={g}
            categories={categories}
            onOpen={onOpen}
            className="w-[190px] shrink-0"
          />
        ))}
      </div>
    </section>
  );
}
