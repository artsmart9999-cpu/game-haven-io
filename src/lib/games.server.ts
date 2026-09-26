import { createClient } from "@supabase/supabase-js";

import type { Category, Game } from "./types";
import { demoCategories, demoGames } from "./catalog";

type GameRow = {
  id: string;
  slug: string;
  title: string;
  embed_url: string;
  thumbnail_url: string | null;
  category_id: string | null;
  tags: string[] | null;
  description: string | null;
  controls: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
  is_published: boolean;
  is_featured: boolean;
  hue: number;
  plays: number;
  likes: number;
  dislikes: number;
  created_at: string;
};

const GAME_COLUMNS =
  "id,slug,title,embed_url,thumbnail_url,category_id,tags,description,controls,seo_title,seo_description,is_published,is_featured,hue,plays,likes,dislikes,created_at";

function publicClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Supabase public credentials are not configured");
  return createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

function toGame(row: GameRow, categoryById: Map<string, Category>): Game {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    embed_url: row.embed_url,
    thumbnail_url: row.thumbnail_url,
    category_id: row.category_id,
    category_slug: row.category_id ? (categoryById.get(row.category_id)?.slug ?? null) : null,
    tags: row.tags ?? [],
    description: row.description ?? "",
    controls: row.controls ?? [],
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    is_published: row.is_published,
    is_featured: row.is_featured,
    hue: row.hue,
    plays: row.plays,
    likes: row.likes,
    dislikes: row.dislikes,
    created_at: row.created_at,
  };
}

export async function loadCategories(): Promise<Category[]> {
  if (!process.env["SUPABASE_URL"] || !process.env["SUPABASE_PUBLISHABLE_KEY"])
    return demoCategories;
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,slug,name_ru,name_en,icon,sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Category[];
}

export async function loadPortal(): Promise<{ categories: Category[]; games: Game[] }> {
  if (!process.env["SUPABASE_URL"] || !process.env["SUPABASE_PUBLISHABLE_KEY"]) {
    return { categories: demoCategories, games: demoGames };
  }
  const supabase = publicClient();
  const [categories, gamesResult] = await Promise.all([
    loadCategories(),
    supabase
      .from("games")
      .select(GAME_COLUMNS)
      .eq("is_published", true)
      .order("created_at", { ascending: false }),
  ]);
  if (gamesResult.error) throw new Error(gamesResult.error.message);
  const byId = new Map(categories.map((c) => [c.id, c]));
  const games = ((gamesResult.data ?? []) as GameRow[]).map((row) => toGame(row, byId));
  return { categories, games };
}

export async function loadGame(
  slug: string,
): Promise<{ game: Game | null; categories: Category[]; related: Game[] }> {
  if (!process.env["SUPABASE_URL"] || !process.env["SUPABASE_PUBLISHABLE_KEY"]) {
    const game = demoGames.find((item) => item.slug === slug) ?? null;
    return {
      game,
      categories: demoCategories,
      related: game
        ? demoGames
            .filter((item) => item.id !== game.id && item.category_id === game.category_id)
            .slice(0, 12)
        : [],
    };
  }
  const supabase = publicClient();
  const categories = await loadCategories();
  const byId = new Map(categories.map((c) => [c.id, c]));

  const { data, error } = await supabase
    .from("games")
    .select(GAME_COLUMNS)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return { game: null, categories, related: [] };

  const game = toGame(data as GameRow, byId);

  const relatedQuery = supabase
    .from("games")
    .select(GAME_COLUMNS)
    .eq("is_published", true)
    .neq("id", game.id)
    .limit(12);
  if (game.category_id) relatedQuery.eq("category_id", game.category_id);
  const relatedResult = await relatedQuery;
  const related = ((relatedResult.data ?? []) as GameRow[]).map((row) => toGame(row, byId));

  return { game, categories, related };
}
