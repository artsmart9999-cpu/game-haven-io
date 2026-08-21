import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ru" | "en";

const dict = {
  ru: {
    brand: "GamePortal",
    home: "Главная",
    popular: "Популярные",
    new: "Новинки",
    categories: "Категории",
    ratings: "Рейтинги",
    admin: "Админка",
    login: "Войти",
    logout: "Выйти",
    searchPlaceholder: "Поиск игр...",
    popularGames: "Популярные игры",
    newGames: "Новые игры",
    allGames: "Все игры",
    resultsFor: "Результаты по",
    nothingFound: "Ничего не найдено",
    play: "Играть",
    playNow: "Играть сейчас",
    featured: "Игра дня",
    plays: "запусков",
    controlsTitle: "Управление",
    aboutTitle: "Об игре",
    similar: "Похожие игры",
    loadingGame: "Игра загружается...",
    checkIframe: "Если ничего не происходит, проверьте ссылку iframe",
    fullscreen: "На весь экран",
    close: "Закрыть",
    like: "Нравится",
    dislike: "Не нравится",
    emptyCategory: "В этой категории пока нет игр",
    // admin
    adminPanel: "Панель управления",
    adminGames: "Игры",
    adminCategories: "Категории",
    addGame: "Добавить игру",
    addCategory: "Добавить категорию",
    edit: "Изменить",
    remove: "Удалить",
    save: "Сохранить",
    cancel: "Отмена",
    published: "Опубликовано",
    featuredFlag: "На главной",
    title: "Название",
    slugLabel: "Ссылка (slug)",
    embedLabel: "Ссылка на игру (iframe)",
    thumbLabel: "Обложка",
    uploadFile: "Загрузить файл",
    orUrl: "или вставьте URL",
    category: "Категория",
    tagsLabel: "Теги (через запятую)",
    descriptionLabel: "Описание",
    controlsLabel: "Управление (по одной строке)",
    seoTitle: "SEO заголовок",
    seoDescription: "SEO описание",
    signIn: "Вход",
    signUp: "Регистрация",
    email: "Email",
    password: "Пароль",
    noAccess: "Нет доступа к админке. Обратитесь к администратору.",
    saved: "Сохранено",
    deleted: "Удалено",
  },
  en: {
    brand: "GamePortal",
    home: "Home",
    popular: "Popular",
    new: "New",
    categories: "Categories",
    ratings: "Ratings",
    admin: "Admin",
    login: "Sign in",
    logout: "Sign out",
    searchPlaceholder: "Search games...",
    popularGames: "Popular games",
    newGames: "New games",
    allGames: "All games",
    resultsFor: "Results for",
    nothingFound: "Nothing found",
    play: "Play",
    playNow: "Play now",
    featured: "Game of the day",
    plays: "plays",
    controlsTitle: "Controls",
    aboutTitle: "About the game",
    similar: "Similar games",
    loadingGame: "Loading game...",
    checkIframe: "If nothing happens, check the iframe link",
    fullscreen: "Fullscreen",
    close: "Close",
    like: "Like",
    dislike: "Dislike",
    emptyCategory: "No games in this category yet",
    adminPanel: "Dashboard",
    adminGames: "Games",
    adminCategories: "Categories",
    addGame: "Add game",
    addCategory: "Add category",
    edit: "Edit",
    remove: "Delete",
    save: "Save",
    cancel: "Cancel",
    published: "Published",
    featuredFlag: "Featured",
    title: "Title",
    slugLabel: "Slug",
    embedLabel: "Game URL (iframe)",
    thumbLabel: "Thumbnail",
    uploadFile: "Upload file",
    orUrl: "or paste a URL",
    category: "Category",
    tagsLabel: "Tags (comma separated)",
    descriptionLabel: "Description",
    controlsLabel: "Controls (one per line)",
    seoTitle: "SEO title",
    seoDescription: "SEO description",
    signIn: "Sign in",
    signUp: "Sign up",
    email: "Email",
    password: "Password",
    noAccess: "No admin access. Ask an administrator.",
    saved: "Saved",
    deleted: "Deleted",
  },
} as const;

export type TranslationKey = keyof (typeof dict)["ru"];

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
};

const LangContext = createContext<LangContextValue>({
  lang: "ru",
  setLang: () => {},
  t: (key) => dict.ru[key],
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");

  useEffect(() => {
    const stored = window.localStorage.getItem("gp-lang");
    if (stored === "en" || stored === "ru") setLangState(stored);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    window.localStorage.setItem("gp-lang", next);
    document.documentElement.lang = next;
  }, []);

  const t = useCallback((key: TranslationKey) => dict[lang][key], [lang]);

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

export function categoryName(
  category: { name_ru: string; name_en: string } | null | undefined,
  lang: Lang,
) {
  if (!category) return "";
  return lang === "ru" ? category.name_ru : category.name_en;
}
