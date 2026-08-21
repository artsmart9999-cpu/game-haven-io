import { createFileRoute } from "@tanstack/react-router";
import { LayoutGrid } from "lucide-react";
import { useState } from "react";

import { AdSlot } from "@/components/AdSlot";
import { GameCard } from "@/components/GameCard";
import { GameModal } from "@/components/GameModal";
import { PortalShell } from "@/components/PortalShell";
import { getPortal } from "@/lib/games.functions";
import { categoryName, useLang } from "@/lib/i18n";
import type { Game } from "@/lib/types";

export const Route = createFileRoute("/category/$slug")({
  loader: () => getPortal(),
  head: ({ params, loaderData }) => {
    const category = loaderData?.categories.find((c) => c.slug === params.slug);
    const name = category?.name_ru ?? params.slug;
    const title = `${name} — играть бесплатно онлайн | GamePortal`;
    const description = `Бесплатные онлайн-игры в категории «${name}». Запуск прямо в браузере, без скачивания.`;
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
  const { categories, games } = Route.useLoaderData();
  const { lang, t } = useLang();
  const [active, setActive] = useState<Game | null>(null);

  const category = categories.find((c) => c.slug === slug);
  const list = games.filter((g) => g.category_id === category?.id);

  return (
    <PortalShell categories={categories}>
      <AdSlot width={728} height={90} label="AdSense 728×90" className="mb-6" />

      <h1 className="mb-5 flex items-center gap-2.5 text-2xl font-extrabold text-foreground">
        <LayoutGrid className="size-6 text-primary" />
        {category ? categoryName(category, lang) : slug}
      </h1>

      {list.length === 0 ? (
        <p className="rounded-2xl bg-surface p-8 text-center text-sm text-muted-foreground">
          {t("emptyCategory")}
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
