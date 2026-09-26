import { Link } from "@tanstack/react-router";
import { ExternalLink, Gamepad2, Maximize2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { FavoriteButton, ShareButtons, VoteButtons } from "@/components/GameActions";
import { registerPlay } from "@/lib/local";
import { useLang } from "@/lib/i18n";
import type { Game } from "@/lib/types";

export function GameModal({ game, onClose }: { game: Game | null; onClose: () => void }) {
  const { t } = useLang();
  const boxRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    if (game) registerPlay(game.id);
  }, [game?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!game) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [game, onClose]);

  if (!game) return null;

  const iconBtn =
    "rounded-lg px-2.5 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground";

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/85 p-4 md:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={game.title}
    >
      <div
        ref={boxRef}
        className="flex h-[85vh] w-full max-w-[1000px] flex-col overflow-hidden rounded-2xl border border-input bg-surface shadow-card duration-300 animate-in fade-in zoom-in-95"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-2 px-5 py-3.5">
          <h2 className="truncate text-lg font-semibold text-foreground">{game.title}</h2>
          <div className="flex items-center gap-1">
            <VoteButtons game={game} />
            <FavoriteButton game={game} />
            <ShareButtons game={game} />
            <button onClick={() => boxRef.current?.requestFullscreen?.()} title={t("fullscreen")} className={iconBtn}>
              <Maximize2 className="size-4" />
            </button>
            <Link to="/game/$slug" params={{ slug: game.slug }} title={game.title} className={iconBtn}>
              <ExternalLink className="size-4" />
            </Link>
            <button
              onClick={onClose}
              title={t("close")}
              className="rounded-lg px-2.5 py-2 text-muted-foreground transition-transform hover:rotate-90 hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="relative flex-1 bg-background">
          {!loaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Gamepad2 className="size-12 animate-pulse text-primary" />
              {t("loadingGame")}
              <span className="text-xs">{t("checkIframe")}</span>
            </div>
          )}
          <iframe
            src={game.embed_url}
            title={game.title}
            allowFullScreen
            allow="autoplay; fullscreen; gamepad"
            onLoad={() => setLoaded(true)}
            className="relative size-full border-0"
          />
        </div>
      </div>
    </div>
  );
}
