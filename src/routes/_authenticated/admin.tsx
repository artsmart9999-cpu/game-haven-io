import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Gamepad2, LayoutGrid, Shield } from "lucide-react";

import { useSession } from "@/hooks/useSession";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Панель управления | GamePortal" },
      { name: "description", content: "Управление играми и категориями GamePortal." },
      { property: "og:title", content: "Панель управления | GamePortal" },
      { property: "og:description", content: "CMS для игрового портала." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { isAdmin, loading } = useSession();
  const { t } = useLang();

  if (loading) {
    return <div className="p-10 text-sm text-muted-foreground">…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-sm rounded-2xl border border-border bg-surface p-7 text-center">
          <Shield className="mx-auto size-8 text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">{t("noAccess")}</p>
          <Link
            to="/"
            className="mt-5 inline-block rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
          >
            {t("home")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[1400px] px-4 py-6 lg:px-8">
      <header className="flex flex-wrap items-center gap-4">
        <h1 className="mr-auto flex items-center gap-2.5 text-2xl font-extrabold text-foreground">
          <Shield className="size-6 text-primary" /> {t("adminPanel")}
        </h1>
        <Link
          to="/"
          className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-foreground"
        >
          {t("home")}
        </Link>
      </header>

      <nav className="mt-5 flex gap-2">
        <Tab to="/admin" label={t("adminGames")} icon={<Gamepad2 className="size-4" />} />
        <Tab
          to="/admin/categories"
          label={t("adminCategories")}
          icon={<LayoutGrid className="size-4" />}
        />
      </nav>

      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}

function Tab({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      activeOptions={{ exact: true }}
      className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground data-[status=active]:border-primary data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
    >
      {icon}
      {label}
    </Link>
  );
}
