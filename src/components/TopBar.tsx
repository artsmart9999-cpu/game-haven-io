import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, Gamepad2 } from "lucide-react";
import { useState } from "react";

export function TopBar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-3 backdrop-blur">
      <button
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        className="grid size-9 place-items-center rounded-lg text-foreground transition-colors hover:bg-surface"
      >
        <Menu className="size-5" />
      </button>

      <Link to="/" className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-gradient-primary shadow-glow">
          <Gamepad2 className="size-5 text-primary-foreground" />
        </span>
        <span className="font-display text-lg font-extrabold text-foreground">
          Playzo<span className="text-primary">Arena</span>
        </span>
      </Link>

      <div className="relative ml-auto w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={value}
          onChange={(e) => {
            const q = e.target.value;
            setValue(q);
            navigate({ to: "/", search: q ? { q } : {} });
          }}
          placeholder="Search 100+ games"
          aria-label="Search games"
          className="h-9 w-full rounded-full border border-border bg-surface pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
        />
      </div>
    </header>
  );
}
