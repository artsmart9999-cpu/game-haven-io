import { Heart, Link2, Send, Share2, ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { castVote, getFavorites, getVote, toggleFavorite } from "@/lib/local";
import { useLang } from "@/lib/i18n";
import type { Game } from "@/lib/types";

const btn =
  "flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm transition-colors text-muted-foreground hover:bg-secondary hover:text-foreground";

export function VoteButtons({ game }: { game: Game }) {
  const { t, lang } = useLang();
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  useEffect(() => setVote(getVote(game.id)), [game.id]);

  const likes = game.likes + (vote === "up" ? 1 : 0);
  const dislikes = game.dislikes + (vote === "down" ? 1 : 0);
  const percent = likes + dislikes > 0 ? Math.round((likes / (likes + dislikes)) * 100) : 0;

  const onVote = (v: "up" | "down") => {
    if (vote) {
      toast(lang === "ru" ? "Вы уже голосовали" : "You already voted");
      return;
    }
    if (castVote(game.id, v)) setVote(v);
  };

  return (
    <>
      <button
        onClick={() => onVote("up")}
        title={t("like")}
        className={vote === "up" ? `${btn} bg-primary text-primary-foreground hover:bg-primary` : btn}
      >
        <ThumbsUp className="size-4" /> {percent}%
      </button>
      <button
        onClick={() => onVote("down")}
        title={t("dislike")}
        className={
          vote === "down" ? `${btn} bg-destructive text-destructive-foreground hover:bg-destructive` : btn
        }
      >
        <ThumbsDown className="size-4" />
      </button>
    </>
  );
}

export function FavoriteButton({ game }: { game: Game }) {
  const { lang } = useLang();
  const [fav, setFav] = useState(false);
  useEffect(() => setFav(getFavorites().includes(game.id)), [game.id]);
  return (
    <button
      onClick={() => {
        const now = toggleFavorite(game.id);
        setFav(now);
        toast(now ? (lang === "ru" ? "Добавлено в избранное" : "Added to favorites") : lang === "ru" ? "Убрано из избранного" : "Removed from favorites");
      }}
      title={lang === "ru" ? "Избранное" : "Favorite"}
      className={btn}
    >
      <Heart className={`size-4 ${fav ? "fill-destructive text-destructive" : ""}`} />
    </button>
  );
}

export function ShareButtons({ game }: { game: Game }) {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const url = () => `${window.location.origin}/game/${game.slug}`;
  const enc = (s: string) => encodeURIComponent(s);
  const links = [
    { name: "Telegram", href: () => `https://t.me/share/url?url=${enc(url())}&text=${enc(game.title)}` },
    { name: "VK", href: () => `https://vk.com/share.php?url=${enc(url())}&title=${enc(game.title)}` },
    { name: "WhatsApp", href: () => `https://wa.me/?text=${enc(`${game.title} ${url()}`)}` },
  ];
  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} title={lang === "ru" ? "Поделиться" : "Share"} className={btn}>
        <Share2 className="size-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-border bg-surface-2 p-1.5 shadow-card">
          {links.map((l) => (
            <button
              key={l.name}
              onClick={() => {
                window.open(l.href(), "_blank", "noopener");
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-secondary"
            >
              <Send className="size-4 text-primary" /> {l.name}
            </button>
          ))}
          <button
            onClick={() => {
              void navigator.clipboard.writeText(url());
              toast(lang === "ru" ? "Ссылка скопирована" : "Link copied");
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-secondary"
          >
            <Link2 className="size-4 text-primary" /> {lang === "ru" ? "Копировать ссылку" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}
