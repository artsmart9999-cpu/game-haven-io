import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/lib/i18n";
import { useAdminData } from "./admin.index";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: AdminCategories,
});

const ICONS = ["Swords", "Crosshair", "Car", "Puzzle", "Trophy", "Globe", "Map", "Gamepad2", "Users", "MousePointerClick"];

type Row = { id?: string; slug: string; name_ru: string; name_en: string; icon: string; sort_order: number };

function AdminCategories() {
  const { t } = useLang();
  const qc = useQueryClient();
  const { data } = useAdminData();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (data) setRows(data.categories.map((c) => ({ ...c })));
  }, [data]);

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-data"] });
  const update = (i: number, patch: Partial<Row>) =>
    setRows((r) => r.map((row, j) => (j === i ? { ...row, ...patch } : row)));

  const save = async (row: Row) => {
    const slug = row.slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-");
    if (!slug || !row.name_ru.trim() || !row.name_en.trim()) return toast.error("slug / RU / EN");
    const payload = { slug, name_ru: row.name_ru.trim(), name_en: row.name_en.trim(), icon: row.icon, sort_order: row.sort_order };
    const res = row.id
      ? await supabase.from("categories").update(payload).eq("id", row.id)
      : await supabase.from("categories").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success(t("saved"));
    void refresh();
  };

  const remove = async (row: Row) => {
    if (!row.id) return setRows((r) => r.filter((x) => x !== row));
    if (!confirm(`${t("remove")} «${row.name_ru}»?`)) return;
    const { error } = await supabase.from("categories").delete().eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success(t("deleted"));
    void refresh();
  };

  const input = "rounded-lg border border-input bg-surface-2 px-3 py-2 text-sm text-foreground";

  return (
    <div className="max-w-4xl">
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={row.id ?? `new-${i}`} className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-3">
            <input type="number" value={row.sort_order} onChange={(e) => update(i, { sort_order: Number(e.target.value) })} className={`${input} w-16`} title="#" />
            <input value={row.name_ru} onChange={(e) => update(i, { name_ru: e.target.value })} placeholder="RU" className={`${input} min-w-[120px] flex-1`} />
            <input value={row.name_en} onChange={(e) => update(i, { name_en: e.target.value })} placeholder="EN" className={`${input} min-w-[120px] flex-1`} />
            <input value={row.slug} onChange={(e) => update(i, { slug: e.target.value })} placeholder="slug" className={`${input} w-32`} />
            <select value={row.icon} onChange={(e) => update(i, { icon: e.target.value })} className={input}>
              {ICONS.map((ic) => <option key={ic}>{ic}</option>)}
            </select>
            <button onClick={() => save(row)} className="rounded-lg bg-primary p-2 text-primary-foreground" title={t("save")}>
              <Save className="size-4" />
            </button>
            <button onClick={() => remove(row)} className="rounded-lg p-2 text-muted-foreground hover:text-destructive" title={t("remove")}>
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => setRows((r) => [...r, { slug: "", name_ru: "", name_en: "", icon: "Gamepad2", sort_order: r.length + 1 }])}
        className="mt-4 flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-foreground"
      >
        <Plus className="size-4" /> {t("addCategory")}
      </button>
    </div>
  );
}
