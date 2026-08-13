import { createFileRoute } from "@tanstack/react-router";

import { AdSlot } from "@/components/AdSlot";
import { GameCard } from "@/components/GameCard";
import { PortalShell } from "@/components/PortalShell";
import { categories, games } from "@/lib/games";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => {
    const name = categories.find((c) => c.slug === params.slug)?.name ?? params.slug;
    const title = `${name} Games — Play Free Online | PlayzoArena`;
    const description = `Free online ${name} games you can play instantly in your browser. No download required.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const name = categories.find((c) => c.slug === slug)?.name ?? slug;
  const list = games.filter((g) => g.category === slug);

  return (
    <PortalShell>
      <AdSlot width={728} height={90} label="AdSense 728×90" className="mb-5" />
      <h1 className="mb-4 text-2xl font-extrabold text-foreground">{name} games</h1>
      {list.length === 0 ? (
        <p className="rounded-xl bg-surface p-8 text-center text-sm text-muted-foreground">
          No games in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {list.map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
        </div>
      )}
    </PortalShell>
  );
}
