import { Link, useNavigate } from "@tanstack/react-router";
import { LogIn, LogOut, Menu, Search, Shield } from "lucide-react";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/lib/i18n";

export function Header({
  onToggleSidebar,
  isAdmin,
  signedIn,
  initialQuery = "",
}: {
  onToggleSidebar: () => void;
  isAdmin: boolean;
  signedIn: boolean;
  initialQuery?: string;
}) {
  const { lang, setLang, t } = useLang();
  const navigate = useNavigate();
  const [value, setValue] = useState(initialQuery);

  useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const trimmed = value.trim().slice(0, 80);
    if (trimmed === initialQuery) return;
    const id = window.setTimeout(() => {
      navigate({ to: "/", search: trimmed ? { q: trimmed } : {} });
    }, 250);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <header className="flex flex-wrap items-center gap-4 py-3 pb-5">
      <button
        onClick={onToggleSidebar}
        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
        aria-label={t("categories")}
      >
        <Menu className="size-6" />
      </button>

      <div className="flex min-w-[220px] max-w-[500px] flex-1 items-center gap-2.5 rounded-full border border-input bg-surface-2 px-5 py-1.5">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={80}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          className="w-full bg-transparent py-2 text-[15px] text-foreground outline-none placeholder:text-muted-foreground/70"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="flex overflow-hidden rounded-full border border-input">
          {(["ru", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1.5 text-xs font-bold uppercase transition-colors ${
                lang === l
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {isAdmin && (
          <Link
            to="/admin"
            className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:flex"
          >
            <Shield className="size-4" /> {t("admin")}
          </Link>
        )}

        {signedIn ? (
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}
            className="flex items-center gap-2 rounded-full bg-secondary px-5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2"
          >
            <LogOut className="size-4" /> {t("logout")}
          </button>
        ) : (
          <Link
            to="/auth"
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
          >
            <LogIn className="size-4" /> {t("login")}
          </Link>
        )}
      </div>
    </header>
  );
}
