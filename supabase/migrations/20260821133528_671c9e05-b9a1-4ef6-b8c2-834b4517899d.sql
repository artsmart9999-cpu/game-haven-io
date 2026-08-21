-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_ru text NOT NULL,
  name_en text NOT NULL,
  icon text NOT NULL DEFAULT 'Gamepad2',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are public" ON public.categories
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins manage categories" ON public.categories
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- GAMES
CREATE TABLE public.games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  embed_url text NOT NULL,
  thumbnail_url text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  description text NOT NULL DEFAULT '',
  controls text[] NOT NULL DEFAULT '{}',
  seo_title text,
  seo_description text,
  is_published boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  hue integer NOT NULL DEFAULT 265,
  plays integer NOT NULL DEFAULT 0,
  likes integer NOT NULL DEFAULT 0,
  dislikes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX games_category_idx ON public.games(category_id);
CREATE INDEX games_published_idx ON public.games(is_published);

GRANT SELECT ON public.games TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.games TO authenticated;
GRANT ALL ON public.games TO service_role;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published games are public" ON public.games
  FOR SELECT TO anon, authenticated USING (is_published);

CREATE POLICY "Admins read all games" ON public.games
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage games" ON public.games
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER games_touch_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- STORAGE policies for thumbnails bucket
CREATE POLICY "Thumbnails are readable" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'game-thumbnails');

CREATE POLICY "Admins upload thumbnails" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'game-thumbnails' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update thumbnails" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'game-thumbnails' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete thumbnails" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'game-thumbnails' AND public.has_role(auth.uid(), 'admin'));

-- SEED CATEGORIES
INSERT INTO public.categories (slug, name_ru, name_en, icon, sort_order) VALUES
  ('action', 'Экшен', 'Action', 'Swords', 1),
  ('shooting', 'Шутеры', 'Shooting', 'Crosshair', 2),
  ('racing', 'Гонки', 'Racing', 'Car', 3),
  ('puzzle', 'Головоломки', 'Puzzle', 'Puzzle', 4),
  ('sports', 'Спорт', 'Sports', 'Trophy', 5),
  ('adventure', 'Приключения', 'Adventure', 'Map', 6),
  ('io', '.io игры', '.io Games', 'Globe', 7),
  ('casual', 'Казуальные', 'Casual', 'Gamepad2', 8);

-- SEED GAMES
INSERT INTO public.games (slug, title, embed_url, category_id, tags, description, controls, is_featured, hue, plays, likes, dislikes)
VALUES
  ('neon-drift-arena', 'Neon Drift Arena', 'https://html5.gamedistribution.com/0e2c1b0a9b0d4a6cbb1a1e2f3a4b5c6d/', (SELECT id FROM public.categories WHERE slug='racing'), ARRAY['дрифт','машины','аркада'], 'Скользите по неоновым трассам, собирайте идеальные дрифты и обгоняйте соперников.', ARRAY['W / ↑ — газ','S / ↓ — тормоз','A / D — поворот','Space — ручник'], true, 275, 4200000, 12840, 640),
  ('shadow-blade-runner', 'Shadow Blade Runner', 'https://html5.gamedistribution.com/1f3d2c4b5a6e7d8c9b0a1f2e3d4c5b6a/', (SELECT id FROM public.categories WHERE slug='action'), ARRAY['ниндзя','платформер','бой'], 'Платформер про ниндзя: точные прыжки, бег по стенам и комбо клинком.', ARRAY['A / D — движение','Space — прыжок','ЛКМ — атака','Shift — рывок'], false, 300, 2800000, 8900, 420),
  ('sniper-tower-siege', 'Sniper Tower Siege', 'https://html5.gamedistribution.com/2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d/', (SELECT id FROM public.categories WHERE slug='shooting'), ARRAY['снайпер','fps','прицел'], 'Удержите башню, делайте невозможные выстрелы и отбейте все волны атак.', ARRAY['Мышь — прицел','ЛКМ — выстрел','R — перезарядка','Shift — задержать дыхание'], true, 195, 6100000, 21000, 900),
  ('block-crush-saga', 'Block Crush Saga', 'https://html5.gamedistribution.com/3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e/', (SELECT id FROM public.categories WHERE slug='puzzle'), ARRAY['три в ряд','логика','релакс'], 'Собирайте цветные блоки, запускайте комбо и пройдите 200 уровней.', ARRAY['ЛКМ — выбрать блок','Перетаскивание — поменять местами'], false, 145, 9400000, 30500, 1200),
  ('street-hoops-3v3', 'Street Hoops 3v3', 'https://html5.gamedistribution.com/4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f/', (SELECT id FROM public.categories WHERE slug='sports'), ARRAY['баскетбол','2 игрока','аркада'], 'Быстрый уличный баскетбол 3 на 3: данки, трюки и игра на двоих.', ARRAY['WASD — игрок 1','Стрелки — игрок 2','Space / Enter — броски'], false, 45, 1900000, 6100, 380),
  ('hexa-snake-io', 'Hexa Snake.io', 'https://html5.gamedistribution.com/5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a/', (SELECT id FROM public.categories WHERE slug='io'), ARRAY['io','мультиплеер','змейка'], 'Вырастите самую длинную змейку на сервере и заприте соперников в своём следе.', ARRAY['Мышь — направление','ЛКМ — ускорение'], true, 165, 12300000, 41000, 1800),
  ('temple-escape-quest', 'Temple Escape Quest', 'https://html5.gamedistribution.com/6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b/', (SELECT id FROM public.categories WHERE slug='adventure'), ARRAY['раннер','3d','побег'], 'Убегайте из рушащегося храма, уклоняйтесь от ловушек и собирайте реликвии.', ARRAY['A / D — сменить полосу','W — прыжок','S — подкат'], false, 85, 3600000, 11200, 520),
  ('bubble-cat-pop', 'Bubble Cat Pop', 'https://html5.gamedistribution.com/7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c/', (SELECT id FROM public.categories WHERE slug='casual'), ARRAY['шарики','мило','для всех'], 'Лопайте шарики, спасайте котят и расслабляйтесь на сотне уютных уровней.', ARRAY['Мышь — прицел','ЛКМ — выстрел шариком'], false, 330, 5500000, 18000, 700),
  ('tank-duel-arena', 'Tank Duel Arena', 'https://html5.gamedistribution.com/8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d/', (SELECT id FROM public.categories WHERE slug='action'), ARRAY['танки','2 игрока','битва'], 'Танковые дуэли на разделённом экране с разрушаемыми стенами и рикошетами.', ARRAY['WASD — танк 1','Стрелки — танк 2','Space / Enter — выстрел'], false, 20, 2200000, 7300, 460),
  ('idle-mine-empire', 'Idle Mine Empire', 'https://html5.gamedistribution.com/9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e/', (SELECT id FROM public.categories WHERE slug='casual'), ARRAY['idle','кликер','апгрейды'], 'Кликайте, нанимайте шахтёров и автоматизируйте подземную империю.', ARRAY['ЛКМ — добывать','Мышь — покупать улучшения'], false, 250, 7800000, 25000, 900),
  ('zombie-city-defense', 'Zombie City Defense', 'https://html5.gamedistribution.com/0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f/', (SELECT id FROM public.categories WHERE slug='shooting'), ARRAY['зомби','защита','выживание'], 'Баррикадируйте улицы, улучшайте турели и продержитесь тридцать ночей.', ARRAY['WASD — движение','ЛКМ — стрелять','1-4 — построить турель'], false, 120, 4900000, 16000, 800),
  ('moto-stunt-x', 'Moto Stunt X', 'https://html5.gamedistribution.com/1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a/', (SELECT id FROM public.categories WHERE slug='racing'), ARRAY['мотоцикл','трюки','физика'], 'Физические трюки на мотоцикле: рампы, петли и невозможные крыши.', ARRAY['W — газ','S — тормоз','A / D — наклон','R — рестарт'], false, 60, 3100000, 9800, 500);