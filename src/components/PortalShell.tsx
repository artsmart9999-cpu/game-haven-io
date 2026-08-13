import { useState, type ReactNode } from "react";

import { SideNav } from "./SideNav";
import { TopBar } from "./TopBar";

export function PortalShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <TopBar onToggleSidebar={() => setCollapsed((c) => !c)} />
      <div className="flex">
        <SideNav collapsed={collapsed} />
        <main className="min-w-0 flex-1 px-3 py-4 md:px-6">{children}</main>
      </div>
      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        PlayzoArena — free HTML5 games in your browser. Games distributed via GameDistribution.
      </footer>
    </div>
  );
}
