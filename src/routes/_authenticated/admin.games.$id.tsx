import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, Wand2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { categoryName, useLang } from "@/lib/i18n";
import { tileStyle } from "@/lib/types";
import { useAdminData } from "./admin.index";

export const Route = createFileRoute("/_authenticated/admin/games/$id")({
  component: GameEditor,
});

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9а-яё]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 100);

/** Accepts gamedistribution.com game page URLs or html5.gamedistribution.com embed URLs. */
function parseGD(input: string): { embed: string; slug?: string; title?: string } | null {
  try {
    const u = new URL(input.trim());
    if (!u.hostname.endsWith("gamedistribution.com")) return null;
    const hex = u.pathname.match(/[0-9a-f]{32}/i)?.[0];
    const page = u.pathname.match(/\/games\/([^/]+)/)?.[1];
    if (u.hostname.startsWith("html5.") && hex) return { embed: `https://html5.gamedistribution.com/${hex}/` };
    if (page) {
      const title = page.split("-").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ");
      return { embed: hex ? `https://html5.gamedistribution.com/${hex}/` : input.trim(), slug: page, title };
    }
    return hex ? { embed: `https://html5.gamedistribution.com/${hex}/` } : null;
  } catch {
    return null;
  }
}

type Form = {
  title: string; slug: string; embed_url: string; thumbnail_url: string; category_id: string;
  tags: string; description: string; controls: string; seo_title: string; seo_description: string;
  is_published: boolean; is_featured: boolean; hue: number;
};
const empty: Form = {
  title: "", slug: "", embed_url: "", thumbnail_url: "", category_id: "", tags: "", description: "",
  controls: "", seo_title: "", seo_description: "", is_published: true, is_featured: false,
  hue: 265,
};

function GameEditor() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data } = useAdminData();
  const [f, setF] = useState<Form>({ ...empty, hue: 265 });
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [gdUrl, setGdUrl] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isNew) {
      setF({ ...empty, hue: Math.floor(Math.random() * 360) });
      return;
    }
    const g = data?.games.find((x) => x.id === id);
    if (!g) return;
    setF({
      title: g.title, slug: g.slug, embed_url: g.embed_url, thumbnail_url: g.thumbnail_url ?? "",
      category_id: g.category_id ?? "", tags: g.tags.join(", "), description: g.description,
      controls: g.controls.join("\n"), seo_title: g.seo_title ?? "", seo_description: g.seo_description ?? "",
      is_published: g.is_published, is_featured: g.is_featured, hue: g.hue,
    });
  }, [id, isNew, data]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));

  const importGD = () => {
    const r = parseGD(gdUrl);
    if (!r) return toast.error(lang === "ru" ? "Не похоже на ссылку GameDistribution" : "Not a GameDistribution link");
    setF((p) => ({
      ...p,
      embed_url: r.embed,
      title: p.title || r.title || "",
      slug: slugTouched && p.slug ? p.slug : r.slug ?? slugify(p.title || r.title || ""),
    }));
    toast.success(lang === "ru" ? "Поля заполнены" : "Fields filled");
  };

  const upload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5 MB");
    setBusy(true);
    const path = `${crypto.randomUUID()}.${file.name.split(".").pop() ?? "jpg"}`;
    const up = await supabase.storage.from("game-thumbnails").upload(path, file, { contentType: file.type });
    if (up.error) {
      setBusy(false);
      return toast.error(up.error.message);
    }
    const signed = await supabase.storage.from("game-thumbnails").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    setBusy(false);
    if (signed.error) return toast.error(signed.error.message);
    set("thumbnail_url", signed.data.signedUrl);
  };

  const save = async () => {
    if (!f.title.trim() || !f.embed_url.trim()) return toast.error(`${t("title")} / ${t("embedLabel")}`);
    const slug = slugify(f.slug || f.title);
    if (!slug) return toast.error(t("slugLabel"));
    setBusy(true);
    const row = {
      title: f.title.trim().slice(0, 150), slug, embed_url: f.embed_url.trim(),
      thumbnail_url: f.thumbnail_url.trim() || null, category_id: f.category_id || null,
      tags: f.tags.split(",").map((s) => s.trim()).filter(Boolean),
      description: f.description.trim(), controls: f.controls.split("\n").map((s) => s.trim()).filter(Boolean),
      seo_title: f.seo_title.trim() || null, seo_description: f.seo_description.trim() || null,
      is_published: f.is_published, is_featured: f.is_featured, hue: f.hue,
    };
    if (f.is_featured) await supabase.from("games").update({ is_featured: false }).neq("id", isNew ? "00000000-0000-0000-0000-000000000000" : id);
    const res = isNew ? await supabase.from("games").insert(row) : await supabase.from("games").update(row).eq("id", id);
    setBusy(false);
    if (res.error) return toast.error(res.error.code === "23505" ? `${t("slugLabel")}: ${slug} — занято` : res.error.message);
    toast.success(t("saved"));
    await qc.invalidateQueries({ queryKey: ["admin-data"] });
    navigate({ to: "/admin" });
  };

  const input = "w-full rounded-lg border border-input bg-surface-2 px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

  return (
    <div className="max-w-3xl">
      <Link to="/admin" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {t("adminGames")}
      </Link>

      <div className="mb-5 rounded-xl border border-primary/40 bg-primary/10 p-4">
        <p className="mb-2 text-sm font-semibold text-foreground">
          {lang === "ru" ? "Быстрый импорт из GameDistribution" : "Quick import from GameDistribution"}
        </p>
        <div className="flex gap-2">
          <input value={gdUrl} onChange={(e) => setGdUrl(e.target.value)} placeholder="https://gamedistribution.com/games/..." className={input} />
          <button onClick={importGD} className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
            <Wand2 className="size-4" /> {lang === "ru" ? "Заполнить" : "Fill"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2">
        <Field label={t("title")}>
          <input value={f.title} maxLength={150} onChange={(e) => { set("title", e.target.value); if (!slugTouched) set("slug", slugify(e.target.value)); }} className={input} />
        </Field>
        <Field label={t("slugLabel")}>
          <input value={f.slug} onChange={(e) => { setSlugTouched(true); set("slug", e.target.value); }} className={input} />
        </Field>
        <Field label={t("embedLabel")} wide>
          <input value={f.embed_url} onChange={(e) => set("embed_url", e.target.value)} placeholder="https://html5.gamedistribution.com/.../" className={input} />
        </Field>
        <Field label={t("thumbLabel")} wide>
          <div className="flex items-center gap-3">
            <div className="h-16 w-28 shrink-0 overflow-hidden rounded-md" style={tileStyle(f.hue)}>
              {f.thumbnail_url && <img src={f.thumbnail_url} alt="" className="size-full object-cover" />}
            </div>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-foreground">
              <Upload className="size-4" /> {busy ? "…" : t("uploadFile")}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            </label>
            <input value={f.thumbnail_url} onChange={(e) => set("thumbnail_url", e.target.value)} placeholder={t("orUrl")} className={input} />
          </div>
        </Field>
        <Field label={t("category")}>
          <select value={f.category_id} onChange={(e) => set("category_id", e.target.value)} className={input}>
            <option value="">—</option>
            {data?.categories.map((c) => <option key={c.id} value={c.id}>{categoryName(c, lang)}</option>)}
          </select>
        </Field>
        <Field label={t("tagsLabel")}>
          <input value={f.tags} onChange={(e) => set("tags", e.target.value)} className={input} />
        </Field>
        <Field label={t("descriptionLabel")} wide>
          <textarea rows={4} value={f.description} onChange={(e) => set("description", e.target.value)} className={input} />
        </Field>
        <Field label={t("controlsLabel")} wide>
          <textarea rows={3} value={f.controls} onChange={(e) => set("controls", e.target.value)} placeholder={"WASD — движение\nМышь — прицел"} className={input} />
        </Field>
        <Field label={t("seoTitle")}>
          <input value={f.seo_title} maxLength={70} onChange={(e) => set("seo_title", e.target.value)} className={input} />
        </Field>
        <Field label={t("seoDescription")}>
          <input value={f.seo_description} maxLength={160} onChange={(e) => set("seo_description", e.target.value)} className={input} />
        </Field>
        <div className="flex flex-wrap gap-5 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={f.is_published} onChange={(e) => set("is_published", e.target.checked)} className="size-4 accent-primary" /> {t("published")}
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={f.is_featured} onChange={(e) => set("is_featured", e.target.checked)} className="size-4 accent-primary" /> {t("featured")}
          </label>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button disabled={busy} onClick={save} className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          {t("save")}
        </button>
        <Link to="/admin" className="rounded-lg bg-secondary px-6 py-2.5 text-sm font-semibold text-foreground">{t("cancel")}</Link>
      </div>
    </div>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
