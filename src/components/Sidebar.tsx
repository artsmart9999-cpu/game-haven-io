import { Link } from "@tanstack/react-router";
import {
  Car,
  Crosshair,
  Flame,
  Heart,
  History,
  TrendingUp,
  Gamepad2,
  Globe,
  Map,
  MousePointerClick,
  Puzzle,
  Shield,
  Sparkles,
  Swords,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

import { categoryName, useLang } from "@/lib/i18n";
import type { Category } from "@/lib/types";

const icons: Record<string, LucideIcon> = {
  Swords,
  Crosshair,
  Car,
  Puzzle,
  Trophy,
  Globe,
  Map,
  Gamepad2,
  Users,
  MousePointerClick,
};

export function Sidebar({
  categories,
  open,
  onClose,
  isAdmin,
}: {
  categories: Category[];
  open: boolean;
  onClose: () => void;
  isAdmin: boolean;
}) {
  const { lang, t } = useLang();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] shrink-0 overflow-y-auto border-r border-sidebar-border bg-sidebar py-5 transition-transform duration-300 scrollbar-thin lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-[260px] lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label={t("categories")}
      >
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center gap-3 px-6 pb-5 text-2xl font-extrabold tracking-tight text-primary"
        >
          <Gamepad2 className="size-7" />
          {t("brand")}
        </Link>

        <nav className="flex flex-col">
          <Item to="/" label={t("home")} icon={Flame} onClick={onClose} exact />
          <Item
            to="/"
            search={{ sort: "new" }}
            label={t("new")}
            icon={Sparkles}
            onClick={onClose}
          />
          <Item to="/" search={{ sort: "top" }} label={t("ratings")} icon={TrendingUp} onClick={onClose} />
          <Item to="/my" search={{ tab: "favorites" }} label={lang === "ru" ? "Избранное" : "Favorites"} icon={Heart} onClick={onClose} />
          <Item to="/my" search={{ tab: "recent" }} label={lang === "ru" ? "Недавние" : "Recent"} icon={History} onClick={onClose} />

          <div className="my-3 h-px bg-sidebar-border mx-6" />
          <p className="px-6 pb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            {t("categories")}
          </p>

          {categories.map((c) => (
            <Item
              key={c.id}
              to="/category/$slug"
              params={{ slug: c.slug }}
              label={categoryName(c, lang)}
              icon={icons[c.icon] ?? Gamepad2}
              onClick={onClose}
            />
          ))}

          {isAdmin && (
            <>
              <div className="my-3 h-px bg-sidebar-border mx-6" />
              <Item to="/admin" label={t("admin")} icon={Shield} onClick={onClose} />
            </>
          )}
        </nav>
      </aside>
    </>
  );
}

function Item({
  to,
  params,
  search,
  label,
  icon: Icon,
  onClick,
  exact,
}: {
  to: string;
  params?: Record<string, string>;
  search?: Record<string, string>;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  exact?: boolean;
}) {
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      params={params as never}
      search={search as never}
      activeOptions={{ exact: exact ?? false }}
      onClick={onClick}
      className="flex items-center gap-3.5 border-l-[3px] border-transparent px-6 py-3 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground data-[status=active]:border-l-primary data-[status=active]:bg-sidebar-accent data-[status=active]:text-foreground"
    >
      <Icon className="size-5 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}
