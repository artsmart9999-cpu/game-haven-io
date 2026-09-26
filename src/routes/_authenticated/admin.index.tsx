import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { categoryName, useLang } from "@/lib/i18n";
import { tileStyle } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminGames,
});

export function useAdminData() {
  return useQuery({
    queryKey: ["admin-data"],
    queryFn: async () => {
      const [g, c] = await Promise.all([
        supabase.from("games").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("*").order("sort_order"),
      ]);
      if (g.error) throw g.error;
      if (c.error) throw c.error;
      return { games: g.data, categories: c.data };
    },
  });
}

function AdminGames() {
  const { lang, t } = useLang();
  const qc = useQueryClient();
  const { data, isLoading } = useAdminData();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [status, setStatus] = useState("");

  const games = (data?.games ?? []).filter(
    (g) =>
      (!q || g.title.toLowerCase().includes(q.toLowerCase())) &&
      (!cat || g.category_id === cat) &&
      (!status ||
        (status === "pub" && g.is_published) ||
        (status === "draft" && !g.is_published) ||
        (status === "feat" && g.is_featured)),
  );

  const remove = async (id: string, title: string) => {
    if (!confirm(`${t("remove")} «${title}»?`)) return;
    const { error } = await supabase.from("games").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(t("deleted"));
    void qc.invalidateQueries({ queryKey: ["admin-data"] });
  };

  const field = "rounded-lg border border-input bg-surface-2 px-3 py-2 text-sm text-foreground";

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchPlaceholder")} className={`${field} min-w-[200px] flex-1`} />
        <select value={cat} onChange={(e) => setCat(e.target.value)} className={field}>
          <option value="">{t("categories")}: —</option>
          {data?.categories.map((c) => (
            <option key={c.id} value={c.id}>{categoryName(c, lang)}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={field}>
          <option value="">—</option>
          <option value="pub">{t("published")}</option>
          <option value="draft">{lang === "ru" ? "Черновики" : "Drafts"}</option>
          <option value="feat">{t("featuredFlag")}</option>
        </select>
        <Link to="/admin/games/$id" params={{ id: "new" }} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          <Plus className="size-4" /> {t("addGame")}
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-surface" />)}</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          {games.map((g) => (
            <div key={g.id} className="flex items-center gap-3 border-b border-border bg-surface px-3 py-2.5 last:border-0">
              <div className="h-11 w-20 shrink-0 overflow-hidden rounded-md" style={tileStyle(g.hue)}>
                {g.thumbnail_url && <img src={g.thumbnail_url} alt="" className="size-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate font-semibold text-foreground">
                  {g.title}
                  {g.is_featured && <Star className="size-3.5 fill-current text-chart-3" />}
                </p>
                <p className="text-xs text-muted-foreground">
                  {categoryName(data?.categories.find((c) => c.id === g.category_id), lang) || "—"} · {g.plays} · 👍 {g.likes}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${g.is_published ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
                {g.is_published ? t("published") : lang === "ru" ? "Черновик" : "Draft"}
              </span>
              <Link to="/admin/games/$id" params={{ id: g.id }} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" title={t("edit")}>
                <Pencil className="size-4" />
              </Link>
              <button onClick={() => remove(g.id, g.title)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-destructive" title={t("remove")}>
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          {games.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">{t("nothingFound")}</p>}
        </div>
      )}
    </div>
  );
}
