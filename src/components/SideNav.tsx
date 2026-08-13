import { Link } from "@tanstack/react-router";
import {
  Car,
  Crosshair,
  Flame,
  Gamepad2,
  Globe,
  Map,
  MousePointerClick,
  Puzzle,
  Sparkles,
  Swords,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

import { categories } from "@/lib/games";

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

export function SideNav({ collapsed }: { collapsed: boolean }) {
  return (
    <nav
      className={`sticky top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 overflow-y-auto border-r border-sidebar-border bg-sidebar py-3 scrollbar-thin md:block ${
        collapsed ? "w-16" : "w-56"
      } transition-[width] duration-200`}
      aria-label="Game categories"
    >
      <NavItem to="/" label="Home" icon={Flame} collapsed={collapsed} exact />
      <NavItem to="/" label="New games" icon={Sparkles} collapsed={collapsed} search={{ sort: "new" }} />

      <div className={`mt-4 mb-1 px-4 text-[11px] uppercase tracking-widest text-muted-foreground ${collapsed ? "hidden" : ""}`}>
        Categories
      </div>

      {categories.map((c) => (
        <NavItem
          key={c.slug}
          to="/category/$slug"
          params={{ slug: c.slug }}
          label={c.name}
          icon={icons[c.icon] ?? Gamepad2}
          collapsed={collapsed}
        />
      ))}
    </nav>
  );
}

function NavItem({
  to,
  params,
  search,
  label,
  icon: Icon,
  collapsed,
  exact,
}: {
  to: string;
  params?: Record<string, string>;
  search?: Record<string, string>;
  label: string;
  icon: LucideIcon;
  collapsed: boolean;
  exact?: boolean;
}) {
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      params={params as never}
      search={search as never}
      activeOptions={{ exact: exact ?? false }}
      title={label}
      className="mx-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-sidebar-foreground transition-colors hover:bg-sidebar-accent data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-primary"
    >
      <Icon className="size-5 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}
