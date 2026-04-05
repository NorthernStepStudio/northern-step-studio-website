export const SITE_NAME = "Northern Step Studio";
export const SITE_ORIGIN =
  typeof window !== "undefined" ? window.location.origin : "https://northernstepstudio.com";

export const BRAND_ASSETS = {
  studioLogo: "/brand/studio-logo-full.png",
  studioMark: "/brand/studio-mark.png",
  provly: "/brand/provly-logo.png",
  nexusbuild: "/brand/nexusbuild-logo.png",
  noobsInvesting: "/brand/noobs-investing-logo.png",
  neuromoves: "/brand/neuromoves-logo.png",
  pasoscore: "/brand/pasoscore-logo.png",
} as const;

export const EXTERNAL_LINKS = {
  contactEmail: "mailto:hello@northernstepstudio.com",
  supportEmail: "mailto:support@northernstepstudio.com",
} as const;

export type LockedSiteLink = Readonly<{
  label: string;
  to: string;
}>;

export type LockedContactChannel = Readonly<{
  label: string;
  href: string;
  value: string;
  icon: "mail" | "updates" | "docs";
}>;

export const LOCKED_SITE_LINKS = Object.freeze({
  header: Object.freeze([
    { label: "Apps", to: "/apps" },
    { label: "Contact", to: "/contact" },
    { label: "About", to: "/about" },
  ]) as readonly LockedSiteLink[],
  footerProducts: Object.freeze([
    { label: "Apps", to: "/apps" },
    { label: "Docs", to: "/docs" },
  ]) as readonly LockedSiteLink[],
  footerCompany: Object.freeze([
    { label: "About", to: "/about" },
    { label: "Workspace AI", to: "/workspace-ai" },
    { label: "Contact", to: "/contact" },
  ]) as readonly LockedSiteLink[],
  footerQuick: Object.freeze([
    { label: "Updates", to: "/updates" },
    { label: "Workspace AI", to: "/workspace-ai" },
    { label: "Contact", to: "/contact" },
    { label: "Docs", to: "/docs" },
  ]) as readonly LockedSiteLink[],
} as const);

export const LOCKED_CONTACT_CHANNELS = Object.freeze([
  {
    label: "Studio and partnerships",
    href: EXTERNAL_LINKS.contactEmail,
    value: "hello@northernstepstudio.com",
    icon: "mail",
  },
  {
    label: "Product support",
    href: EXTERNAL_LINKS.supportEmail,
    value: "support@northernstepstudio.com",
    icon: "mail",
  },
  {
    label: "Build updates",
    href: "/updates",
    value: "Read latest updates",
    icon: "updates",
  },
  {
    label: "Docs and setup",
    href: "/docs",
    value: "Open support docs",
    icon: "docs",
  },
] as const);

export function resolveSiteUrl(pathOrUrl = "/"): string {
  if (!pathOrUrl) {
    return SITE_ORIGIN;
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  try {
    return new URL(pathOrUrl, SITE_ORIGIN).toString();
  } catch {
    return SITE_ORIGIN;
  }
}
