let localFallbackSecret: string | null = null;
let warnedAboutLocalFallback = false;

const getLocalFallbackSecret = () => {
  if (!localFallbackSecret) {
    localFallbackSecret = `local-dev-${crypto.randomUUID()}-${crypto.randomUUID()}`;
  }
  return localFallbackSecret;
};

const isProdLikeEnv = (env: { NODE_ENV?: string; ENVIRONMENT?: string }) => {
  const runtimeEnv = String(env.NODE_ENV ?? env.ENVIRONMENT ?? "")
    .trim()
    .toLowerCase();
  return runtimeEnv === "production" || runtimeEnv === "staging";
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

export const getJwtSecret = (env: {
  JWT_SECRET?: string;
  NODE_ENV?: string;
  ENVIRONMENT?: string;
}) => {
  const configured = String(env.JWT_SECRET ?? "").trim();
  if (!isMissingOrPlaceholder(configured)) {
    return configured;
  }

  if (isProdLikeEnv(env)) {
    throw new Error("JWT_SECRET is required and must not use a development placeholder in production/staging.");
  }

  if (!warnedAboutLocalFallback) {
    warnedAboutLocalFallback = true;
    console.warn(
      "[security] JWT_SECRET is missing or placeholder. Using an ephemeral local secret for this worker process."
    );
  }

  return getLocalFallbackSecret();
};
