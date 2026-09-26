import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Gamepad2, KeyRound, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import {
  AuthError,
  getSettings,
  handleAuthCallback,
  login,
  oauthLogin,
  requestPasswordRecovery,
  signup,
} from "@netlify/identity";
import { Link } from "@tanstack/react-router";
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
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    void getSettings()
      .then((settings) => setGoogleEnabled(Boolean(settings.providers.google)))
      .catch(() => setGoogleEnabled(false));
    void handleAuthCallback()
      .then((result) => {
        if (result?.type === "confirmation" || result?.type === "oauth") {
          toast.success("Аккаунт подтверждён. Добро пожаловать!");
          navigate({ to: "/" });
        }
      })
      .catch((error: unknown) =>
        toast.error(error instanceof Error ? error.message : "Не удалось завершить вход"),
      );
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setBusy(true);
    try {
      if (mode === "in") {
        await login(parsed.data.email, parsed.data.password);
        navigate({ to: "/" });
      } else {
        const user = await signup(parsed.data.email, parsed.data.password, {
          full_name: name.trim(),
        });
        if (user.confirmedAt) navigate({ to: "/" });
        else toast.success("Проверьте почту — мы отправили ссылку для подтверждения.");
      }
    } catch (error) {
      toast.error(
        error instanceof AuthError && error.status === 401
          ? "Неверный email или пароль"
          : error instanceof Error
            ? error.message
            : "Ошибка авторизации",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-backdrop grid min-h-screen lg:grid-cols-[1.1fr_.9fr]">
      <section className="relative hidden overflow-hidden border-r border-white/10 p-14 lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-3 text-xl font-extrabold text-white">
          <Gamepad2 className="size-7 text-primary" /> ARCADECK
        </Link>
        <div className="relative z-10 max-w-xl">
          <p className="mb-5 text-xs font-extrabold uppercase tracking-[.28em] text-primary">
            Твой игровой пропуск
          </p>
          <h1 className="font-display text-6xl font-extrabold leading-[.94] text-white">
            Сохраняй игры.
            <br />
            Продолжай с любого места.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/60">
            Один аккаунт для избранного, истории запусков и персональных подборок.
          </p>
        </div>
        <div className="flex gap-8 text-sm text-white/55">
          <span>500+ игр</span>
          <span>Без установки</span>
          <span>Бесплатно</span>
        </div>
      </section>
      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md rounded-[28px] border border-border bg-surface/95 p-7 shadow-2xl md:p-9">
          <Link
            to="/"
            className="mb-7 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground lg:hidden"
          >
            <ArrowLeft className="size-4" /> На главную
          </Link>
          <div className="mb-7">
            <div className="flex items-center gap-2.5 text-2xl font-extrabold text-foreground">
              <Gamepad2 className="size-7 text-primary" />{" "}
              {mode === "in" ? "С возвращением" : "Создать аккаунт"}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "in"
                ? "Войдите, чтобы продолжить игру"
                : "Регистрация занимает меньше минуты"}
            </p>
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
            {mode === "up" && (
              <label className="auth-field">
                <UserRound />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Имя игрока"
                  maxLength={50}
                />
              </label>
            )}
            <label className="auth-field">
              <Mail />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("email")}
                autoComplete="email"
                maxLength={255}
              />
            </label>
            <label className="auth-field">
              <KeyRound />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("password")}
                autoComplete={mode === "in" ? "current-password" : "new-password"}
                maxLength={72}
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Подождите…" : mode === "in" ? t("signIn") : t("signUp")}
            </button>
          </form>

          {mode === "in" && (
            <button
              onClick={async () => {
                if (!email) {
                  toast.error("Сначала введите email");
                  return;
                }
                try {
                  await requestPasswordRecovery(email);
                  toast.success("Ссылка для восстановления отправлена");
                } catch (error) {
                  toast.error(
                    error instanceof Error ? error.message : "Не удалось отправить письмо",
                  );
                }
              }}
              className="mt-3 w-full text-center text-xs font-semibold text-muted-foreground hover:text-primary"
            >
              Забыли пароль?
            </button>
          )}
          {googleEnabled && (
            <>
              <div className="my-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                или
                <span className="h-px flex-1 bg-border" />
              </div>
              <button
                onClick={() => oauthLogin("google")}
                className="mt-3 w-full rounded-xl border border-input bg-surface-2 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Продолжить с Google
              </button>
            </>
          )}
          <p className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] leading-relaxed text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" /> Данные защищены Netlify Identity
          </p>
        </div>
      </div>
    </div>
  );
}
