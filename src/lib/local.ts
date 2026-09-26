import { supabase } from "@/integrations/supabase/client";

const FAV = "gp-favorites";
const RECENT = "gp-recent";
const VOTES = "gp-votes";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "") as T;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("gp-local"));
}

export const getFavorites = () => read<string[]>(FAV, []);
export const getRecent = () => read<string[]>(RECENT, []);
export const getVote = (id: string) => read<Record<string, "up" | "down">>(VOTES, {})[id] ?? null;

export function toggleFavorite(id: string) {
  const list = getFavorites();
  const next = list.includes(id) ? list.filter((x) => x !== id) : [id, ...list];
  write(FAV, next);
  return next.includes(id);
}

async function bump(id: string, kind: "play" | "like" | "dislike") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.rpc as any)("increment_game_stat", { _game_id: id, _kind: kind });
}

const playedThisSession = new Set<string>();
export function registerPlay(id: string) {
  write(RECENT, [id, ...getRecent().filter((x) => x !== id)].slice(0, 24));
  if (playedThisSession.has(id)) return;
  playedThisSession.add(id);
  void bump(id, "play");
}

/** One vote per browser; returns false if already voted. */
export function castVote(id: string, vote: "up" | "down") {
  const votes = read<Record<string, "up" | "down">>(VOTES, {});
  if (votes[id]) return false;
  votes[id] = vote;
  write(VOTES, votes);
  void bump(id, vote === "up" ? "like" : "dislike");
  return true;
}
