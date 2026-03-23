export const SITE_NAME = "Northern Step Studio";
export const SITE_ORIGIN =
  typeof window !== "undefined" ? window.location.origin : "https://northernstepstudio.com";

export const BRAND_ASSETS = {
  studioLogo: "/brand/studio-logo-full.svg",
  studioMark: "/brand/studio-mark.svg",
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
