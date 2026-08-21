import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Gamepad2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/lib/i18n";

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
});

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Вход и регистрация | GamePortal" },
      {
        name: "description",
        content: "Войдите в GamePortal, чтобы управлять играми и сохранять избранное.",
      },
      { property: "og:title", content: "Вход и регистрация | GamePortal" },
      { property: "og:description", content: "Аккаунт GamePortal — вход и регистрация." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setBusy(true);
    const { error } =
      mode === "in"
        ? await supabase.auth.signInWithPassword(parsed.data)
        : await supabase.auth.signUp({
            ...parsed.data,
            options: { emailRedirectTo: window.location.origin },
          });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/" });
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error.message ?? "OAuth error");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-7">
        <div className="mb-6 flex items-center justify-center gap-2.5 text-xl font-extrabold text-primary">
          <Gamepad2 className="size-6" /> {t("brand")}
        </div>

        <div className="mb-5 flex overflow-hidden rounded-full border border-input">
          {(
            [
              ["in", t("signIn")],
              ["up", t("signUp")],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setMode(value)}
              className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                mode === value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("email")}
            autoComplete="email"
            maxLength={255}
            className="w-full rounded-xl border border-input bg-surface-2 px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("password")}
            autoComplete={mode === "in" ? "current-password" : "new-password"}
            maxLength={72}
            className="w-full rounded-xl border border-input bg-surface-2 px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {mode === "in" ? t("signIn") : t("signUp")}
          </button>
        </form>

        <button
          onClick={google}
          className="mt-3 w-full rounded-xl border border-input bg-surface-2 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          Google
        </button>
      </div>
    </div>
  );
}
