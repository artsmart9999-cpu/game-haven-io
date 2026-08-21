export type Category = {
  id: string;
  slug: string;
  name_ru: string;
  name_en: string;
  icon: string;
  sort_order: number;
};

export type Game = {
  id: string;
  slug: string;
  title: string;
  embed_url: string;
  thumbnail_url: string | null;
  category_id: string | null;
  category_slug: string | null;
  tags: string[];
  description: string;
  controls: string[];
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

export function tileStyle(hue: number) {
  return {
    backgroundImage: `linear-gradient(135deg, hsl(${hue} 75% 60%), hsl(${(hue + 55) % 360} 60% 35%))`,
  };
}

export function formatPlays(n: number, lang: "ru" | "en") {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}${lang === "ru" ? " млн" : "M"}`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}${lang === "ru" ? " тыс" : "K"}`;
  return String(n);
}
