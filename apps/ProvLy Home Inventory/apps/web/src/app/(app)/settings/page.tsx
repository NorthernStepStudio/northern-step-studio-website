"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/utils/supabase/client";
import { useAppSnapshot } from "@/lib/useAppSnapshot";

export default function SettingsPage() {
  const router = useRouter();
  const { data, loading, error } = useAppSnapshot();
  const [workingAction, setWorkingAction] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleSignOut() {
    setWorkingAction("signout");
    setActionError(null);

    try {
      const supabase = createClient();
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        throw signOutError;
      }

      router.push("/login");
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to sign out",
      );
    } finally {
      setWorkingAction(null);
    }
  }

  async function handleExportData() {
    setWorkingAction("export");
    setActionError(null);

    try {
      const response = await fetch("/api/account/export", { method: "POST" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to export data");
      }

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "provly-account-export.json";
      link.click();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to export data",
      );
    } finally {
      setWorkingAction(null);
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Delete this account from ProvLy? This will mark the account for deletion and sign you out.",
    );

    if (!confirmed) {
      return;
    }

    setWorkingAction("delete");
    setActionError(null);

    try {
      const response = await fetch("/api/account", { method: "DELETE" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to delete account");
      }

      await handleSignOut();
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to delete account",
      );
      setWorkingAction(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-6 shadow-sm">
        <p className="text-sm text-[color:var(--muted)]">Loading settings…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-[color:var(--danger)]/20 bg-[color:var(--card)] p-6 shadow-sm">
        <p className="text-sm font-semibold text-[color:var(--danger)]">Settings unavailable</p>
        <p className="mt-2 text-sm text-[color:var(--muted)]">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
          Settings
        </p>
        <h1 className="text-3xl font-semibold">Account & data</h1>
        <p className="text-sm text-[color:var(--muted)]">
          Keep your inventory secure and export-ready.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Account</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Signed in as {data?.user.email || "Unknown account"}
          </p>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Plan: {data?.profile?.subscription_tier || "free"}
          </p>
          <button
            className="mt-4 rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={workingAction === "signout"}
            onClick={handleSignOut}
          >
            {workingAction === "signout" ? "Signing out…" : "Sign out"}
          </button>
        </div>

        <div className="rounded-3xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Data export</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Exports are retained for 7 days, then removed automatically.
          </p>
          <button
            className="mt-4 rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={workingAction === "export"}
            onClick={handleExportData}
          >
            {workingAction === "export" ? "Preparing…" : "Export my data"}
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-[color:var(--card-border)] bg-[color:var(--card)] p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Delete account</h2>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Permanently remove your account and all stored inventory data.
        </p>
        <button
          className="mt-4 rounded-2xl bg-[color:var(--danger)] px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={workingAction === "delete" || workingAction === "signout"}
          onClick={handleDeleteAccount}
        >
          {workingAction === "delete" ? "Deleting…" : "Delete account"}
        </button>
        {actionError ? (
          <p className="mt-3 text-xs text-[color:var(--danger)]">{actionError}</p>
        ) : null}
      </section>
    </div>
  );
}
