export const ASSISTANT_TOKEN_COSTS = {
  assistant_chat: 5,
  build_review: 100,
  fps_deep_dive: 15,
  smart_build: 150,
};

export const parseTokens = (val) => {
  if (typeof val === "number") return val;
  if (!val) return 0;
  const s = String(val).toLowerCase().trim();
  if (s.endsWith("k")) return parseFloat(s) * 1000;
  if (s.endsWith("m")) return parseFloat(s) * 1000000;
  return parseFloat(s.replace(/[^0-9.]/g, "")) || 0;
};

const normalizeAction = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "_");

const hasBudget = (text) =>
  /\bbudget\b|\$\s?\d{2,6}|\b\d{1,2}(?:\.\d)?k\b|\b\d{3,6}\s*(?:usd|dollars?|bucks)\b/.test(
    text,
  );

const hasPcContext = (text) =>
  /\b(pc|computer|rig|setup|gaming|streaming|workstation|custom pc|parts)\b/.test(
    text,
  );

export const isSmartBuildRequest = (text) => {
  const normalized = String(text ?? "").toLowerCase();
  if (!normalized.trim()) {
    return false;
  }

  const specificBuildPattern =
    /\b(build me|new pc|pc build|gaming pc|streaming pc|workstation|custom pc|parts list|recommend(?: a)? build|budget build|generate(?: my)? build|smart build ai|build a pc|build for gaming|build for streaming|build for workstation|what parts do i need for (?:a )?(?:pc|computer)|what should i buy for (?:a )?(?:pc|computer)|what do i need for (?:a )?(?:pc|computer)|suggest a build|spec me a build|assemble a build)\b/;
  const hasBuildVerb = /\bbuild\b/.test(normalized);

  return (
    specificBuildPattern.test(normalized) ||
    (hasBuildVerb && hasPcContext(normalized)) ||
    (hasBudget(normalized) && hasPcContext(normalized))
  );
};

const isBuildReviewRequest = (text) =>
  /\b(review my build|review build|build review|analyze my build|check my build|rate my build|how is my build)\b/.test(
    text,
  );

const isFpsDeepDiveRequest = (text) =>
  /\b(fps|frames|frame rate|show fps|fps estimate|fps deep dive|bottleneck)\b/.test(
    text,
  );

export const inferAssistantRequestType = (
  text,
  { requestType = null, hasCurrentBuild = false, hasGpu = false } = {},
) => {
  const explicit = normalizeAction(requestType);
  if (
    explicit &&
    Object.prototype.hasOwnProperty.call(ASSISTANT_TOKEN_COSTS, explicit)
  ) {
    return explicit;
  }

  const normalized = String(text ?? "").toLowerCase();

  if (hasCurrentBuild && isBuildReviewRequest(normalized)) {
    return "build_review";
  }

  if (hasCurrentBuild && isFpsDeepDiveRequest(normalized)) {
    return "fps_deep_dive";
  }

  if (isSmartBuildRequest(normalized)) {
    return "smart_build";
  }

  return "assistant_chat";
};

export const getAssistantTokenCost = (text, options = {}) => {
  const action = inferAssistantRequestType(text, options);
  return ASSISTANT_TOKEN_COSTS[action] || ASSISTANT_TOKEN_COSTS.assistant_chat;
};
