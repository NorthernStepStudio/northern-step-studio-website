import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Bell, KeyRound, Mail, Settings, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/react-app/lib/auth";

function Toggle({
  checked,
  onChange,
  title,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
}) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        title={title}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <div className="h-7 w-12 rounded-full bg-muted transition-colors after:absolute after:start-[3px] after:top-[3px] after:h-5 after:w-5 after:rounded-full after:border after:border-white/40 after:bg-white after:transition-all peer-checked:bg-accent peer-checked:after:translate-x-5" />
    </label>
  );
}

export default function UserPreferences() {
  const { t } = useTranslation();
  const { user, fetchUser, isPending } = useAuth();
  const [preferences, setPreferences] = useState({
    email_thread_replies: true,
    email_mentions: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<"success" | "error" | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordState, setPasswordState] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    const loadPreferences = async () => {
      try {
        const response = await fetch("/api/user/preferences");
        if (response.ok) {
          const data = await response.json();
          setPreferences({
            email_thread_replies: data.email_thread_replies === 1,
            email_mentions: data.email_mentions === 1,
          });
        }
      } catch (error) {
        console.error("Failed to load preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadPreferences();
  }, [isPending, user]);

  const savePreferences = async () => {
    setSaving(true);
    setSaveState(null);

    try {
      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_thread_replies: preferences.email_thread_replies,
          email_mentions: preferences.email_mentions,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }

      setSaveState("success");
      setTimeout(() => setSaveState(null), 3000);
    } catch (error) {
      console.error(error);
      setSaveState("error");
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordState(null);

    if (passwordForm.newPassword.trim().length < 8) {
      setPasswordState({ type: "error", text: "Use at least 8 characters for your password." });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordState({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    setPasswordSaving(true);

    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Failed to update password");
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordState({ type: "success", text: "Password login is ready for this account." });
      await fetchUser();
    } catch (error) {
      setPasswordState({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update password.",
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse rounded-[2rem] border border-border bg-card p-6">
          <div className="h-3 w-28 rounded-full bg-secondary" />
          <div className="mt-4 h-10 w-72 rounded-full bg-secondary" />
          <div className="mt-3 h-5 w-full max-w-2xl rounded-full bg-secondary" />
        </div>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),320px]">
          <div className="space-y-6 rounded-[2rem] border border-border bg-card p-6">
            <div className="h-56 rounded-[1.5rem] bg-secondary" />
            <div className="h-56 rounded-[1.5rem] bg-secondary" />
          </div>
          <div className="h-64 rounded-[2rem] border border-border bg-card" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <section className="account-surface py-16 text-center">
        <Settings className="mx-auto mb-4 h-14 w-14 text-muted-foreground" />
        <h2 className="text-2xl font-black uppercase">{t("profile.sign_in_required")}</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-6 text-muted-foreground">
          {t("profile.sign_in_message")}
        </p>
        <Link to="/login" className="account-button-primary mt-6 inline-flex">
          {t("profile.sign_in_button")}
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="account-surface p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-accent">
              <Settings className="h-3.5 w-3.5" />
              Account Controls
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">
              Preferences and sign-in
            </h2>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-muted-foreground sm:text-base">
              Control how this account signs in and which studio emails you want to receive.
            </p>
          </div>

          <Link to="/profile/edit" className="account-button-secondary inline-flex self-start lg:self-auto">
            Edit profile
          </Link>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),320px]">
        <div className="space-y-6">
          <section className="account-surface space-y-6 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-accent/12 text-accent">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Security</p>
                <h3 className="mt-2 text-xl font-black uppercase">Password login</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
                  {user.has_password
                    ? "Update your existing password to keep direct sign-in available alongside Google."
                    : "Add a password if you want this account to sign in without Google."}
                </p>
              </div>
            </div>

            <form onSubmit={savePassword} className="space-y-4">
              {user.has_password && (
                <div>
                  <label htmlFor="currentPassword" className="account-label mb-2 block">
                    Current password
                  </label>
                  <input
                    id="currentPassword"
                    title="Current Password"
                    type="password"
                    autoComplete="current-password"
                    value={passwordForm.currentPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))
                    }
                    className="account-input"
                  />
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="newPassword" className="account-label mb-2 block">
                    New password
                  </label>
                  <input
                    id="newPassword"
                    title="New Password"
                    type="password"
                    autoComplete="new-password"
                    value={passwordForm.newPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))
                    }
                    className="account-input"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="account-label mb-2 block">
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    title="Confirm New Password"
                    type="password"
                    autoComplete="new-password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) =>
                      setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))
                    }
                    className="account-input"
                    required
                  />
                </div>
              </div>

              <div className="account-surface-subtle px-5 py-4 text-sm font-medium leading-6 text-muted-foreground">
                Regular account access is always available at <strong>/login</strong>. Use the Contact page for direct support or account issues.
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <button type="submit" disabled={passwordSaving} className="account-button-primary">
                  {passwordSaving ? "Saving password..." : user.has_password ? "Update Password" : "Enable Password Login"}
                </button>

                {passwordState && (
                  <p className={`text-sm font-medium ${passwordState.type === "success" ? "text-emerald-300" : "text-red-300"}`}>
                    {passwordState.text}
                  </p>
                )}
              </div>
            </form>
          </section>

          <section className="account-surface space-y-6 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-accent/12 text-accent">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Notifications</p>
                <h3 className="mt-2 text-xl font-black uppercase">Email delivery</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
                  Choose which community and studio alerts should still hit your inbox.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="account-surface-subtle px-5 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wide">{t("preferences.thread_replies")}</h4>
                    <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
                      {t("preferences.thread_replies_description")}
                    </p>
                  </div>
                  <Toggle
                    title={t("preferences.thread_replies")}
                    checked={preferences.email_thread_replies}
                    onChange={(checked) =>
                      setPreferences((current) => ({ ...current, email_thread_replies: checked }))
                    }
                  />
                </div>
              </div>

              <div className="account-surface-subtle px-5 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wide">{t("preferences.mentions")}</h4>
                    <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
                      {t("preferences.mentions_description")}
                    </p>
                    <p className="mt-2 text-xs font-medium leading-5 text-muted-foreground">
                      Mention alerts apply to studio notes, community threads, and community replies.
                    </p>
                  </div>
                  <Toggle
                    title={t("preferences.mentions")}
                    checked={preferences.email_mentions}
                    onChange={(checked) =>
                      setPreferences((current) => ({ ...current, email_mentions: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <button onClick={savePreferences} disabled={saving} className="account-button-primary">
                {saving ? t("preferences.saving") : t("preferences.save")}
              </button>

              {saveState && (
                <p className={`text-sm font-medium ${saveState === "success" ? "text-emerald-300" : "text-red-300"}`}>
                  {saveState === "success" ? t("preferences.success") : t("preferences.error")}
                </p>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
          <section className="account-surface p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/12 text-accent">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Access Summary</p>
                <h3 className="text-lg font-black uppercase">Login methods</h3>
              </div>
            </div>

            <div className="space-y-3">
              <div className="account-surface-subtle px-4 py-4">
                <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wide">
                  <Mail className="h-4 w-4 text-accent" />
                  Google
                </div>
                <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
                  Available when Google auth is configured for this environment.
                </p>
              </div>

              <div className="account-surface-subtle px-4 py-4">
                <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wide">
                  <KeyRound className="h-4 w-4 text-accent" />
                  Email + Password
                </div>
                <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
                  {user.has_password ? "Enabled for this account." : "Not enabled yet for this account."}
                </p>
              </div>
            </div>
          </section>

          <section className="account-surface p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/12 text-accent">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">Delivery Notes</p>
                <h3 className="text-lg font-black uppercase">Email address</h3>
              </div>
            </div>

            <p className="text-sm font-medium leading-6 text-muted-foreground">
              <strong>{t("preferences.note")}</strong> {t("preferences.note_text", { email: user.email || "your email" })}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
