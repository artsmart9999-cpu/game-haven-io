import { Link } from "@tanstack/react-router";
import { ExternalLink, Gamepad2, Maximize2, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useLang } from "@/lib/i18n";
import type { Game } from "@/lib/types";

export function GameModal({ game, onClose }: { game: Game | null; onClose: () => void }) {
  const { t } = useLang();
  const boxRef = useRef<HTMLDivElement>(null);
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    setVote(null);
  }, [game?.id]);

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

  const likes = game.likes + (vote === "up" ? 1 : 0);
  const dislikes = game.dislikes + (vote === "down" ? 1 : 0);
  const total = likes + dislikes;
  const percent = total > 0 ? Math.round((likes / total) * 100) : 0;

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
            <button
              onClick={() => setVote((v) => (v === "up" ? null : "up"))}
              title={t("like")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                vote === "up"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <ThumbsUp className="size-4" />
              {percent}%
            </button>
            <button
              onClick={() => setVote((v) => (v === "down" ? null : "down"))}
              title={t("dislike")}
              className={`rounded-lg px-2.5 py-2 transition-colors ${
                vote === "down"
                  ? "bg-destructive text-destructive-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <ThumbsDown className="size-4" />
            </button>
            <button
              onClick={() => boxRef.current?.requestFullscreen?.()}
              title={t("fullscreen")}
              className="rounded-lg px-2.5 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Maximize2 className="size-4" />
            </button>
            <Link
              to="/game/$slug"
              params={{ slug: game.slug }}
              title={game.title}
              className="rounded-lg px-2.5 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
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

        <div className="relative flex-1 bg-[#0b0e14]">
          {game.embed_url ? (
            <iframe
              src={game.embed_url}
              title={game.title}
              allowFullScreen
              className="size-full border-0"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
              <Gamepad2 className="size-12" />
              {t("loadingGame")}
              <span className="text-sm text-muted-foreground/60">{t("checkIframe")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
