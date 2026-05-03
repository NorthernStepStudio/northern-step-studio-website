import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { AlertCircle, CheckCircle2, ExternalLink, ShieldCheck, Sparkles, Trash2, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/react-app/components/ui/avatar";
import { useAuth } from "@/react-app/lib/auth";

export default function EditProfile() {
  const { t } = useTranslation();
  const { user, isPending, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    display_name: "",
    bio: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setFormData({
            email: data.email || "",
            display_name: data.display_name || "",
            bio: data.bio || "",
            avatar_url: data.avatar_url || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchProfile();
  }, [isPending, navigate, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: formData.display_name,
          bio: formData.bio,
          avatar_url: formData.avatar_url,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || t("edit_profile.error"));
      }

      setFormData({
        email: data?.email || formData.email,
        display_name: data?.display_name || "",
        bio: data?.bio || "",
        avatar_url: data?.avatar_url || "",
      });
      await fetchUser();
      setMessage({ type: "success", text: t("edit_profile.success") });
    } catch (error) {
      console.error("Failed to update profile:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : t("edit_profile.error"),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setAvatarUploading(true);
    setMessage(null);

    try {
      const uploadData = new FormData();
      uploadData.append("avatar", file);

      const response = await fetch("/api/user/profile/avatar", {
        method: "POST",
        body: uploadData,
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error || "Unable to upload avatar right now.");
      }

      setFormData((current) => ({
        ...current,
        avatar_url: typeof data?.url === "string" ? data.url : current.avatar_url,
      }));
      await fetchUser();
      setMessage({ type: "success", text: "Avatar image uploaded." });
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to upload avatar right now.",
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarRemove = () => {
    setFormData((current) => ({ ...current, avatar_url: "" }));
    setMessage({
      type: "success",
      text: "Avatar removed from the form. Save changes to remove it from your profile.",
    });
  };

  const previewName = formData.display_name.trim() || formData.email.split("@")[0] || "User";
  const avatarFallback = previewName.charAt(0).toUpperCase();

  if (isPending || loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse rounded-[2rem] border border-border bg-card p-6">
          <div className="h-3 w-32 rounded-full bg-secondary" />
          <div className="mt-4 h-10 w-64 rounded-full bg-secondary" />
          <div className="mt-3 h-5 w-full max-w-2xl rounded-full bg-secondary" />
        </div>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),320px]">
          <div className="space-y-6 rounded-[2rem] border border-border bg-card p-6">
            <div className="h-28 rounded-[1.5rem] bg-secondary" />
            <div className="h-28 rounded-[1.5rem] bg-secondary" />
            <div className="h-48 rounded-[1.5rem] bg-secondary" />
          </div>
          <div className="h-64 rounded-[2rem] border border-border bg-card" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="account-surface p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              Public Identity
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">
              Edit profile details
            </h2>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-muted-foreground sm:text-base">
              This is the information people see on your profile, in community spaces, and around studio collaboration surfaces.
            </p>
          </div>

          <Link to="/profile" className="account-button-secondary self-start lg:self-auto">
            View profile
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {message && (
        <div
          className={`flex items-start gap-3 rounded-[1.75rem] border px-5 py-4 ${
            message.type === "success"
              ? "border-accent/24 bg-accent/8 text-accent"
              : "border-red-500/25 bg-red-500/10 text-red-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          )}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),320px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="account-surface space-y-6 p-6 sm:p-8">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="account-label mb-2 block">
                  Account email
                </label>
                <div className="account-surface-subtle px-5 py-4">
                  <p className="text-sm font-semibold tracking-normal text-foreground">{formData.email}</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {t("edit_profile.email_readonly")}
                  </p>
                </div>
              </div>

              <div>
                <label className="account-label mb-2 block">
                  {t("edit_profile.display_name")}
                </label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(event) => setFormData({ ...formData, display_name: event.target.value })}
                  placeholder={t("edit_profile.display_name_placeholder")}
                  maxLength={100}
                  className="account-input"
                />
                <p className="mt-2 text-xs font-medium text-muted-foreground">
                  {t("edit_profile.display_name_hint")}
                </p>
              </div>

              <div>
                <label className="account-label mb-2 block">
                  Avatar image
                </label>
                <div className="account-surface-subtle p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-14 w-14 rounded-[1.2rem] border border-border bg-secondary/35" size="lg">
                      {formData.avatar_url ? (
                        <AvatarImage src={formData.avatar_url} alt={`${previewName} avatar`} className="rounded-[1.2rem]" />
                      ) : null}
                      <AvatarFallback className="rounded-[1.2rem] bg-accent/10 text-xl font-black text-accent">
                        {avatarFallback}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {formData.avatar_url ? "Profile image ready" : "No image uploaded"}
                      </p>
                      <p className="mt-1 text-xs font-medium leading-5 text-muted-foreground">
                        JPEG, PNG, GIF, or WebP up to 5MB.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <label className="account-button-primary cursor-pointer">
                      <Upload className="h-4 w-4" />
                      {avatarUploading ? "Uploading..." : "Upload"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                        onChange={handleAvatarUpload}
                        disabled={avatarUploading}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleAvatarRemove}
                      disabled={!formData.avatar_url || avatarUploading}
                      className="account-button-secondary"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="account-label mb-2 block">
                {t("edit_profile.bio")}
              </label>
              <textarea
                value={formData.bio}
                onChange={(event) => setFormData({ ...formData, bio: event.target.value })}
                placeholder={t("edit_profile.bio_placeholder")}
                maxLength={500}
                rows={6}
                className="account-input min-h-[190px] resize-none"
              />
              <div className="mt-2 flex items-center justify-between gap-4">
                <p className="text-xs font-medium text-muted-foreground">
                  {t("edit_profile.bio_hint")}
                </p>
                <p className="text-xs font-semibold text-muted-foreground">{formData.bio.length}/500</p>
              </div>
            </div>
          </section>

          <section className="account-surface flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Save when the preview looks right.</p>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                Keep this clean and specific. It should read like a profile, not a dump of metadata.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => navigate("/profile")} className="account-button-secondary">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="account-button-primary">
                {saving ? t("edit_profile.saving") : t("edit_profile.save_changes")}
              </button>
            </div>
          </section>
        </form>

        <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
          <section className="account-surface overflow-hidden p-0">
            <div className="bg-[linear-gradient(135deg,rgba(193,242,91,0.18),rgba(193,242,91,0.03)_48%,rgba(80,125,255,0.08)_100%)] px-6 py-5">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-accent">Live Preview</p>
            </div>
            <div className="space-y-5 p-6">
              <Avatar className="h-24 w-24 rounded-[1.75rem] border border-border bg-secondary/35" size="lg">
                {formData.avatar_url ? (
                  <AvatarImage src={formData.avatar_url} alt={`${previewName} avatar`} className="rounded-[1.75rem]" />
                ) : null}
                <AvatarFallback className="rounded-[1.75rem] bg-accent/10 text-3xl font-black text-accent">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-accent">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Public Card
                </div>
                <h3 className="text-2xl font-black uppercase">{previewName}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
                  {formData.bio.trim() || "Your short bio will appear here once you save it."}
                </p>
              </div>
            </div>
          </section>

          <section className="account-surface p-6">
            <h3 className="text-lg font-black uppercase">What good looks like</h3>
            <div className="mt-4 space-y-4 text-sm font-medium leading-6 text-muted-foreground">
              <p>Use a clear display name people recognize immediately.</p>
              <p>Keep the bio short enough to scan in one pass.</p>
              <p>Only use a real avatar if it strengthens the profile.</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
