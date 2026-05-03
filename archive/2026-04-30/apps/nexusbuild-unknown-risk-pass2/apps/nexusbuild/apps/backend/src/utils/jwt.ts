import { randomBytes } from "crypto";

const LOCAL_FALLBACK_SECRET = `local-dev-${randomBytes(32).toString("hex")}`;
let warnedAboutLocalFallback = false;

const isProdLikeEnv = () => {
  const nodeEnv = String(process.env.NODE_ENV ?? "")
    .trim()
    .toLowerCase();
  return nodeEnv === "production" || nodeEnv === "staging";
};

const isMissingOrPlaceholder = (value: string) => {
  if (!value) {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  return (
    normalized === "dev-secret-key" ||
    normalized === "replace-with-strong-secret" ||
    normalized === "change-me"
  );
};

export const getJwtSecret = () => {
  const configured = String(process.env.JWT_SECRET ?? "").trim();
  if (!isMissingOrPlaceholder(configured)) {
    return configured;
  }

  if (isProdLikeEnv()) {
    throw new Error("JWT_SECRET is required and must not use a development placeholder in production/staging.");
  }

  if (!warnedAboutLocalFallback) {
    warnedAboutLocalFallback = true;
    console.warn(
      "[security] JWT_SECRET is missing or placeholder. Using an ephemeral local secret for this process only."
    );
  }

  return LOCAL_FALLBACK_SECRET;
};
