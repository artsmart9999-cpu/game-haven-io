CREATE OR REPLACE FUNCTION public.increment_game_stat(_game_id uuid, _kind text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _kind = 'play' THEN UPDATE games SET plays = plays + 1 WHERE id = _game_id AND is_published;
  ELSIF _kind = 'like' THEN UPDATE games SET likes = likes + 1 WHERE id = _game_id AND is_published;
  ELSIF _kind = 'dislike' THEN UPDATE games SET dislikes = dislikes + 1 WHERE id = _game_id AND is_published;
  END IF;
END; $$;
GRANT EXECUTE ON FUNCTION public.increment_game_stat(uuid, text) TO anon, authenticated;