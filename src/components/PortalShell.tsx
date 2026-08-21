import { useState, type ReactNode } from "react";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useSession } from "@/hooks/useSession";
import { useLang } from "@/lib/i18n";
import type { Category } from "@/lib/types";

export function PortalShell({
  categories,
  children,
  query = "",
}: {
  categories: Category[];
  children: ReactNode;
  query?: string;
}) {
  const [open, setOpen] = useState(false);
  const { isAdmin, signedIn } = useSession();
  const { t } = useLang();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        categories={categories}
        open={open}
        onClose={() => setOpen(false)}
        isAdmin={isAdmin}
      />
      <div className="mx-auto flex min-w-0 w-full max-w-[1400px] flex-1 flex-col px-4 py-2 lg:px-8">
        <Header
          onToggleSidebar={() => setOpen((v) => !v)}
          isAdmin={isAdmin}
          signedIn={signedIn}
          initialQuery={query}
        />
        <main className="min-w-0 flex-1">{children}</main>
        <footer className="mt-12 border-t border-border py-6 text-center text-xs text-muted-foreground">
          {t("brand")} — HTML5 games. Powered by GameDistribution.
        </footer>
      </div>
    </div>
  );
}
