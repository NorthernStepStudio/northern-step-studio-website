const CATEGORY_ALIASES: Record<string, string> = {
  cpu: "cpu",
  processor: "cpu",
  gpu: "gpu",
  "graphics card": "gpu",
  "graphics-card": "gpu",
  "video card": "gpu",
  "video-card": "gpu",
  motherboard: "motherboard",
  mobo: "motherboard",
  ram: "ram",
  memory: "ram",
  storage: "storage",
  ssd: "storage",
  hdd: "storage",
  nvme: "storage",
  psu: "psu",
  "power supply": "psu",
  "power-supply": "psu",
  case: "case",
  cooler: "cooler",
  "cpu cooler": "cooler",
  "cpu-cooler": "cooler",
  fan: "fan",
  fans: "fan",
  monitor: "monitor",
  keyboard: "keyboard",
  mouse: "mouse",
  os: "os",
  accessory: "accessory",
  accessory_id: "accessory",
  headset: "headset",
  headphones: "headset",
};

export const normalizeBuildCategory = (
  value: string | null | undefined,
): string => {
  if (!value) return "part";
  const normalized = value.toLowerCase().replace(/[_-]+/g, " ").trim();
  return CATEGORY_ALIASES[normalized] || normalized.replace(/\s+/g, "-");
};

export const parseNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(/[^0-9.]+/g, ""));
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return 0;
};

export const toOptionalString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export type IncomingPart = {
  name: string;
  category: string;
  price: number;
  url: string | null;
  imageUrl: string | null;
  specifications: Record<string, unknown> | null;
};

const toSpecifications = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
};

export const normalizeIncomingParts = (parts: unknown): IncomingPart[] => {
  if (!parts) {
    return [];
  }

  const sourceEntries = Array.isArray(parts)
    ? parts.map((value, index) => [String(index), value] as const)
    : typeof parts === "object"
      ? Object.entries(parts as Record<string, unknown>)
      : [];

  return sourceEntries
    .map(([key, rawValue]) => {
      if (
        !rawValue ||
        typeof rawValue !== "object" ||
        Array.isArray(rawValue)
      ) {
        return null;
      }

      const value = rawValue as Record<string, unknown>;
      const name =
        toOptionalString(value.name) ||
        toOptionalString(value.title) ||
        toOptionalString(value.model);

      if (!name) {
        return null;
      }

      const category = normalizeBuildCategory(
        toOptionalString(value.category) ||
          key.replace(/_id$/i, "").replace(/_/g, " "),
      );

      const url =
        toOptionalString(value.url) ||
        toOptionalString(value.buyLink) ||
        toOptionalString(value.buy_link) ||
        toOptionalString(value.ebayUrl);

      const imageUrl =
        toOptionalString(value.imageUrl) ||
        toOptionalString(value.image_url) ||
        toOptionalString(value.image);

      return {
        name,
        category,
        price: parseNumber(value.price ?? value.salePrice ?? value.amount),
        url,
        imageUrl,
        specifications:
          toSpecifications(value.specifications) ||
          toSpecifications(value.specs),
      } satisfies IncomingPart;
    })
    .filter((part): part is IncomingPart => part !== null);
};

export const serializePart = (part: any) => ({
  id: part.id,
  name: part.name,
  category: normalizeBuildCategory(part.category),
  price: Number(part.price || 0),
  url: part.url ?? null,
  image_url: part.image_url ?? part.imageUrl ?? null,
  imageUrl: part.image_url ?? part.imageUrl ?? null,
  specs: part.specifications ?? part.specs ?? {},
  specifications: part.specifications ?? part.specs ?? {},
});

export const serializeUser = (user: any) => ({
  id: user.id,
  username: user.username,
  displayName: user.username,
  email: user.email,
  tokens: Number(user.tokens || 0),
  bio: user.bio ?? "",
  profile_image: user.profile_image ?? null,
  avatar: user.profile_image ?? null,
  is_admin: Boolean(user.is_admin),
  is_moderator: Boolean(user.is_moderator),
  is_suspended: Boolean(user.is_suspended),
  email_verified: !Boolean(user.is_suspended),
  avatar_frame: user.avatar_frame ?? "basic",
  showcase_build_id: user.showcase_build_id ?? null,
  is_public_profile:
    user.is_public_profile === undefined
      ? true
      : Boolean(user.is_public_profile),
  created_at: user.created_at ?? null,
  role: user.is_admin ? "admin" : user.is_moderator ? "moderator" : "user",
  profile: {
    bio: user.bio ?? "",
    frameId: user.avatar_frame ?? "basic",
  },
});

export const serializeBuild = (build: any) => {
  const partsList = Array.isArray(build.parts)
    ? build.parts.map(serializePart)
    : [];
  const parts = partsList.reduce(
    (
      acc: Record<string, ReturnType<typeof serializePart>>,
      part: ReturnType<typeof serializePart>,
    ) => {
      acc[part.category] = part;
      return acc;
    },
    {} as Record<string, ReturnType<typeof serializePart>>,
  );
  const relationUser = build.user ?? build.users ?? null;

  return {
    id: build.id,
    user_id: build.user_id ?? build.userId ?? null,
    name: build.name,
    description: build.description ?? "",
    total_price: Number(build.total_price ?? build.totalPrice ?? 0),
    totalPrice: Number(build.total_price ?? build.totalPrice ?? 0),
    image_url: build.image_url ?? build.imageUrl ?? null,
    imageUrl: build.image_url ?? build.imageUrl ?? null,
    is_public:
      build.is_public === undefined
        ? Boolean(build.isPublic)
        : Boolean(build.is_public),
    is_featured:
      build.is_featured === undefined
        ? Boolean(build.isFeatured)
        : Boolean(build.is_featured),
    likes: build.likes ?? build.likes_count ?? build.likesCount ?? 0,
    likes_count: build.likes ?? build.likes_count ?? build.likesCount ?? 0,
    created_at: build.created_at ?? build.createdAt ?? null,
    updated_at: build.updated_at ?? build.updatedAt ?? null,
    username: build.username ?? relationUser?.username ?? null,
    user: relationUser
      ? {
          id: relationUser.id,
          username: relationUser.username,
          email: relationUser.email ?? null,
        }
      : null,
    parts,
    parts_list: partsList,
    parts_count: partsList.length,
  };
};
