import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, History } from "lucide-react";
import { useEffect, useState } from "react";

import { GameCard } from "@/components/GameCard";
import { GameModal } from "@/components/GameModal";
import { PortalShell } from "@/components/PortalShell";
import { getPortal } from "@/lib/games.functions";
import { useLang } from "@/lib/i18n";
import { getFavorites, getRecent } from "@/lib/local";
import type { Game } from "@/lib/types";

export const Route = createFileRoute("/my")({
  validateSearch: (s: Record<string, unknown>): { tab: "favorites" | "recent" } => ({
    tab: s["tab"] === "recent" ? "recent" : "favorites",
  }),
  loader: () => getPortal(),
  head: () => ({
    meta: [
      { title: "Мои игры — избранное и недавние | GamePortal" },
      { name: "description", content: "Ваши избранные и недавно сыгранные браузерные игры." },
      { property: "og:title", content: "Мои игры | GamePortal" },
      { property: "og:description", content: "Избранные и недавно сыгранные игры." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MyGames,
});

function MyGames() {
  const { categories, games } = Route.useLoaderData();
  const { tab } = Route.useSearch();
  const { lang } = useLang();
  const [ids, setIds] = useState<string[]>([]);
  const [active, setActive] = useState<Game | null>(null);

  useEffect(() => {
    const sync = () => setIds(tab === "recent" ? getRecent() : getFavorites());
    sync();
    window.addEventListener("gp-local", sync);
    return () => window.removeEventListener("gp-local", sync);
  }, [tab]);

  const byId = new Map(games.map((g) => [g.id, g]));
  const list = ids.map((id) => byId.get(id)).filter((g): g is Game => Boolean(g));
  const ru = lang === "ru";
  const tabs = [
    { key: "favorites" as const, label: ru ? "Избранное" : "Favorites", Icon: Heart },
    { key: "recent" as const, label: ru ? "Недавние" : "Recent", Icon: History },
  ];

  return (
    <PortalShell categories={categories}>
      <div className="mb-6 flex gap-2">
        {tabs.map(({ key, label, Icon }) => (
          <Link
            key={key}
            to="/my"
            search={{ tab: key }}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
              tab === key ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted-foreground"
            }`}
          >
            <Icon className="size-4" /> {label}
          </Link>
        ))}
      </div>
      {list.length === 0 ? (
        <p className="rounded-2xl bg-surface p-8 text-center text-sm text-muted-foreground">
          {tab === "recent"
            ? ru ? "Вы ещё не играли ни в одну игру" : "You haven't played anything yet"
            : ru ? "Нажмите на сердечко в игре, чтобы добавить её сюда" : "Tap the heart in a game to save it here"}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {list.map((g) => (
            <GameCard key={g.id} game={g} categories={categories} onOpen={setActive} />
          ))}
        </div>
      )}
      <GameModal game={active} onClose={() => setActive(null)} />
    </PortalShell>
  );
}
