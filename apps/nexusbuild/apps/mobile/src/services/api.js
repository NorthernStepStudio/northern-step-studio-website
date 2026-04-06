import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getApiBaseUrl,
  getLocalApiBaseUrl,
  API_CONFIG,
  FEATURES,
} from "../core/config";
import {
  generateSmartResponse,
  simulateStreamingResponse,
  generateComponentRationale,
} from "../domain/ai";
import { resolveBenchmarkScore } from "../core/performanceScore";
import { MOCK_PARTS, MOCK_BUILDS, MOCK_USER, MOCK_LINKS } from "./mockData";

const API_BASE_URL = getApiBaseUrl();
const LOCAL_API_BASE_URL = getLocalApiBaseUrl();

const PRICE_CATEGORY_MAP = {
  cpu: "cpu",
  gpu: "gpu",
  motherboard: "motherboard",
  ram: "ram",
  storage: "storage",
  psu: "psu",
  case: "case",
  cooler: "cooler",
  fan: "case",
  monitor: "monitor",
  keyboard: "keyboard",
  mouse: "mouse",
  headset: "headphones",
  accessory: "storage",
  os: "storage",
};

const APP_CATEGORY_ALIASES = {
  cpu: "cpu",
  processor: "cpu",
  gpu: "gpu",
  "graphics-card": "gpu",
  "graphics card": "gpu",
  "video-card": "gpu",
  "video card": "gpu",
  motherboard: "motherboard",
  mobo: "motherboard",
  ram: "ram",
  memory: "ram",
  storage: "storage",
  "internal-hard-drive": "storage",
  ssd: "storage",
  hdd: "storage",
  nvme: "storage",
  psu: "psu",
  "power-supply": "psu",
  "power supply": "psu",
  case: "case",
  cooler: "cooler",
  "cpu-cooler": "cooler",
  "cpu cooler": "cooler",
  fan: "fan",
  monitor: "monitor",
  keyboard: "keyboard",
  mouse: "mouse",
  headphones: "headset",
  headset: "headset",
  os: "os",
  accessory: "accessory",
};

const normalizeCategory = (value) => {
  if (!value) return "part";
  const normalized = String(value).toLowerCase().replace(/[_-]+/g, " ").trim();
  return APP_CATEGORY_ALIASES[normalized] || normalized.replace(/\s+/g, "-");
};

const parsePrice = (value) => {
  const parsed = Number.parseFloat(
    String(value ?? "").replace(/[^0-9.]+/g, ""),
  );
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizePart = (part, fallbackCategory = null) => ({
  id: part?.id || part?.url || `${part?.name}-${fallbackCategory || "part"}`,
  name: part?.name || part?.title || "Unknown Part",
  category: normalizeCategory(part?.category || fallbackCategory),
  manufacturer:
    part?.manufacturer ||
    part?.merchant ||
    part?.price?.merchant ||
    "PCPartPicker",
  price: parsePrice(part?.price?.lowestPrice ?? part?.price ?? part?.salePrice),
  score: resolveBenchmarkScore({
    ...part,
    category: part?.category || fallbackCategory,
  }),
  originalPrice: part?.originalPrice ?? null,
  salePrice: parsePrice(
    part?.salePrice ?? part?.price?.lowestPrice ?? part?.price,
  ),
  discount: part?.discount ?? null,
  image_url: part?.image_url || part?.imageUrl || part?.image || null,
  imageUrl: part?.imageUrl || part?.image_url || part?.image || null,
  url: part?.url || part?.price?.buyLink || part?.ebayUrl || null,
  specs: part?.specs || part?.specifications || {},
  specifications: part?.specs || part?.specifications || {},
});

const normalizePriceProduct = (product, fallbackCategory) => {
  const offers = Array.isArray(product?.price?.offers)
    ? product.price.offers
    : [];
  const lowestPrice = parsePrice(product?.price?.lowestPrice);
  const highestOffer = offers.reduce((max, offer) => {
    const price = parsePrice(offer?.price);
    return price > max ? price : max;
  }, 0);
  const originalPrice = highestOffer > lowestPrice ? highestOffer : null;

  return normalizePart(
    {
      ...product,
      price: lowestPrice,
      salePrice: lowestPrice,
      originalPrice,
      discount: originalPrice
        ? Math.round(((originalPrice - lowestPrice) / originalPrice) * 100)
        : null,
      manufacturer: product?.price?.merchant || product?.manufacturer,
    },
    fallbackCategory,
  );
};

const normalizePartsMap = (parts) => {
  if (!parts) return {};
  if (!Array.isArray(parts)) {
    return Object.entries(parts).reduce((acc, [key, value]) => {
      if (!value) return acc;
      const part = normalizePart({ ...value, category: value.category || key });
      acc[normalizeCategory(part.category)] = part;
      return acc;
    }, {});
  }

  return parts.reduce((acc, part) => {
    const normalized = normalizePart(part);
    acc[normalized.category] = normalized;
    return acc;
  }, {});
};

const normalizeBuild = (build) => {
  if (!build) return null;
  const parts = normalizePartsMap(build.parts || build.parts_list);
  return {
    id: build.id,
    name: build.name || "Untitled Build",
    description: build.description || "",
    total_price: parsePrice(build.total_price ?? build.totalPrice),
    totalPrice: parsePrice(build.total_price ?? build.totalPrice),
    image_url: build.image_url || build.imageUrl || null,
    is_public: build.is_public ?? build.isPublic ?? true,
    is_featured: build.is_featured ?? build.isFeatured ?? false,
    likes: build.likes ?? build.likes_count ?? 0,
    likes_count: build.likes ?? build.likes_count ?? 0,
    created_at: build.created_at || build.createdAt || new Date().toISOString(),
    updated_at: build.updated_at || build.updatedAt || null,
    username: build.username || build.user?.username || null,
    user: build.user || null,
    parts,
    parts_list: Object.values(parts),
  };
};

const normalizeBuildRecommendations = (build) => {
  const sourceParts = Array.isArray(build?.parts)
    ? build.parts
    : Array.isArray(build?.parts_list)
      ? build.parts_list
      : build?.parts && typeof build.parts === "object"
        ? Object.values(build.parts)
        : [];

  return sourceParts
    .filter(Boolean)
    .map((part) => normalizePart(part, part?.category));
};

const normalizeBuildList = (payload) => {
  const builds = Array.isArray(payload) ? payload : payload?.builds || [];
  return builds.map(normalizeBuild).filter(Boolean);
};

const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    displayName: user.displayName || user.username,
    avatar: user.avatar || user.profile_image || null,
    profile: user.profile || {
      bio: user.bio || "",
      frameId: user.avatar_frame || "basic",
    },
  };
};

const attachRecommendationRationales = (payload) => {
  if (!payload?.recommendations?.length) return payload;

  const context = payload.context?.preferences || payload.context || {};
  return {
    ...payload,
    recommendations: payload.recommendations.map((rec) => {
      if (!rec || rec.rationale) return rec;
      return {
        ...rec,
        rationale: generateComponentRationale({
          category: rec.category,
          name: rec.name || rec.title,
          specs: rec.specs,
          context,
        }),
      };
    }),
  };
};

const computeBudgetAllocation = (budget, useCase = "gaming") => {
  const allocationTemplates = {
    streaming: {
      gpu: 0.35,
      cpu: 0.28,
      ram: 0.12,
      storage: 0.1,
      motherboard: 0.1,
      psu: 0.03,
      case: 0.02,
    },
    workstation: {
      cpu: 0.35,
      gpu: 0.25,
      ram: 0.15,
      storage: 0.12,
      motherboard: 0.08,
      psu: 0.03,
      case: 0.02,
    },
    creator: {
      gpu: 0.34,
      cpu: 0.28,
      ram: 0.12,
      storage: 0.12,
      motherboard: 0.09,
      psu: 0.03,
      case: 0.02,
    },
    gaming: {
      gpu: 0.45,
      cpu: 0.22,
      ram: 0.08,
      storage: 0.1,
      motherboard: 0.1,
      psu: 0.03,
      case: 0.02,
    },
  };

  const template = allocationTemplates[useCase] || allocationTemplates.gaming;
  const allocation = {};
  const explanations = [];

  Object.entries(template).forEach(([component, ratio]) => {
    allocation[component] = Math.round(budget * ratio);
  });

  if (useCase === "workstation") {
    explanations.push(
      "Priority shifted toward CPU and RAM for productivity workloads.",
    );
  } else if (useCase === "streaming") {
    explanations.push("Streaming balances GPU output with extra CPU headroom.");
  } else {
    explanations.push("Gaming budgets prioritize the GPU first.");
  }

  return {
    tier: "budget",
    budget,
    use_case: useCase,
    allocation,
    allocations: Object.entries(template).map(([component, ratio]) => ({
      component,
      percent_range: {
        min: Math.round(ratio * 100),
        max: Math.round(ratio * 100),
      },
      amount_range: {
        min: Math.round(budget * ratio),
        max: Math.round(budget * ratio),
      },
    })),
    recommendations: Object.entries(allocation).map(([component, amount]) => ({
      component,
      amount,
      percentage: Math.round((amount / budget) * 100),
      explanation: `Recommended spend for ${component.toUpperCase()}.`,
    })),
    general_advice: explanations,
  };
};

let warnedAuth = false;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (!warnedAuth) {
        console.warn("Authentication failed (401) - token invalid or expired");
        warnedAuth = true;
      }
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("user");
    }
    return Promise.reject(error);
  },
);

const localApi =
  LOCAL_API_BASE_URL && LOCAL_API_BASE_URL !== API_BASE_URL
    ? axios.create({
        baseURL: LOCAL_API_BASE_URL,
        timeout: API_CONFIG.timeout,
        headers: API_CONFIG.headers,
      })
    : null;

if (localApi) {
  localApi.interceptors.request.use(
    async (config) => {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );
}

const buildLocalGeneralResponse = (message, buildContext = null) => {
  try {
    const smartResponse = generateSmartResponse(message, {
      currentBuild: buildContext,
    });
    if (smartResponse?.text) {
      return smartResponse;
    }
  } catch (error) {
    console.warn(
      "Local general response fallback failed:",
      error?.message || error,
    );
  }

  return {
    text: "General Chat can explain PC parts, terminology, and how NexusBuild works. Assistant Chat is the paid mode for full build recommendations, compatibility checks, and Builder handoff.",
    suggestions: [
      "What parts do I need for a PC?",
      "What does a GPU do?",
      "How does NexusBuild work?",
      "What can Assistant Chat do?",
    ],
  };
};

const callLocalChatApi = async (
  message,
  sessionId,
  memorySnapshot,
  options = {},
) => {
  if (!localApi) return null;
  try {
    const response = await localApi.post("/chat", {
      sessionId,
      mode: options.mode,
      userContext: options.userContext,
      messages: [
        ...(memorySnapshot?.conversationHistory || [])
          .slice(-10)
          .map((entry) => ({
            role: entry.role === "user" ? "user" : "assistant",
            content: entry.content,
          })),
        { role: "user", content: message },
      ],
    });
    return response.data;
  } catch {
    return null;
  }
};

export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      return {
        ...response.data,
        user: normalizeUser(response.data.user),
      };
    } catch (e) {
      if (!FEATURES.MOCK_ALL_APIS) throw e;
      console.warn("Network/auth error, using mock login:", e.message);
      const username = email?.split("@")?.[0] || "User";
      const mockUser = normalizeUser({
        ...MOCK_USER,
        id: `mock-${Date.now()}`,
        email,
        username,
        role: "user",
        is_admin: false,
        is_moderator: false,
      });
      const token = `mock-token-${Date.now()}`;
      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("user", JSON.stringify(mockUser));
      return { token, user: mockUser };
    }
  },

  register: async (username, email, password) => {
    try {
      const response = await api.post("/auth/register", {
        username,
        email,
        password,
      });
      return {
        ...response.data,
        user: normalizeUser(response.data.user),
      };
    } catch (e) {
      if (!FEATURES.MOCK_ALL_APIS) throw e;
      console.warn("Registration failed, using mock success:", e.message);
      const mockUser = normalizeUser({
        ...MOCK_USER,
        id: `mock-${Date.now()}`,
        email,
        username,
        role: "user",
        is_admin: false,
        is_moderator: false,
      });
      const token = `mock-token-${Date.now()}`;
      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("user", JSON.stringify(mockUser));
      return { token, user: mockUser };
    }
  },

  logout: async () => {
    // Handled by Context
  },

  syncPurchase: async (productId, userId) => {
    const response = await api.post("/billing/sync-purchase", {
      productId,
      userId,
    });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/auth/me");
    return normalizeUser(response.data);
  },
};

export const partsAPI = {
  getAll: async (category = null) => {
    try {
      if (!category) {
        return Object.values(MOCK_PARTS).flat();
      }
      const response = await api.get(
        `/prices/trending/${PRICE_CATEGORY_MAP[category] || category}`,
        {
          params: { limit: 12 },
        },
      );
      const parts = (response.data?.products || []).map((product) =>
        normalizePriceProduct(product, category),
      );
      return parts.length > 0 ? parts : MOCK_PARTS[category] || [];
    } catch (e) {
      console.warn("Network error getting parts, using mock data:", e.message);
      return category
        ? MOCK_PARTS[category] || []
        : Object.values(MOCK_PARTS).flat();
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/parts/${id}`);
      return normalizePart(response.data?.part || response.data);
    } catch (e) {
      const allParts = Object.values(MOCK_PARTS).flat();
      const mock = allParts.find((part) => String(part.id) === String(id));
      if (mock) return mock;
      throw e;
    }
  },

  search: async (query, category = null) => {
    try {
      const response = await api.get("/prices/search", {
        params: {
          q: query,
          category: category
            ? PRICE_CATEGORY_MAP[category] || category
            : undefined,
        },
      });
      return (response.data?.products || []).map((product) =>
        normalizePriceProduct(product, category),
      );
    } catch (e) {
      console.warn("Search failed, using mock search:", e.message);
      if (!query) return [];
      const allParts = Object.values(MOCK_PARTS).flat();
      const lowerQuery = query.toLowerCase();
      return allParts.filter((part) =>
        part.name.toLowerCase().includes(lowerQuery),
      );
    }
  },

  scrape: async (category) => partsAPI.getAll(category),

  getPriceHistory: async (id, days = 30) => {
    try {
      const response = await api.get(`/parts/${id}/price-history`, {
        params: { days },
      });
      return response.data;
    } catch {
      return Array.from({ length: 10 }, (_, index) => ({
        date: new Date(Date.now() - index * 86400000).toISOString(),
        price: Number((Math.random() * 100 + 100).toFixed(2)),
      }));
    }
  },

  setPriceAlert: async (id, targetPrice) => {
    try {
      const response = await api.post(`/parts/${id}/price-alerts`, {
        target_price: targetPrice,
      });
      return response.data;
    } catch {
      return { success: true, message: "Mock alert set" };
    }
  },

  getPriceDrops: async () => {
    try {
      const response = await api.get("/prices/trending/gpu", {
        params: { limit: 12 },
      });
      return (response.data?.products || []).map((p) =>
        normalizePriceProduct(p, "gpu"),
      );
    } catch {
      return [];
    }
  },
};

export const buildsAPI = {
  getAll: async () => {
    try {
      const response = await api.get("/builds");
      return normalizeBuildList(response.data);
    } catch (e) {
      if (e.response?.status !== 401) {
        console.warn("Build fetch failed, using local mocks:", e.message);
      }
      return MOCK_BUILDS;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/builds/${id}`);
      return normalizeBuild(response.data?.build || response.data);
    } catch (e) {
      const mock = MOCK_BUILDS.find((build) => String(build.id) === String(id));
      if (mock) return mock;
      throw e;
    }
  },

  create: async (buildData) => {
    const response = await api.post("/builds", buildData);
    return {
      ...response.data,
      build: normalizeBuild(response.data?.build),
    };
  },

  update: async (id, buildData) => {
    const response = await api.put(`/builds/${id}`, buildData);
    return {
      ...response.data,
      build: normalizeBuild(response.data?.build),
    };
  },

  delete: async (id) => {
    const response = await api.delete(`/builds/${id}`);
    return response.data;
  },

  getUserBuilds: async () => {
    const response = await api.get("/builds");
    return normalizeBuildList(response.data);
  },

  sync: async (data) => {
    const response = await api.post("/builds/sync", data);
    return {
      ...response.data,
      builds: normalizeBuildList(response.data),
    };
  },

  getCommunity: async (params) => {
    try {
      const response = await api.get("/builds/community", { params });
      return {
        ...response.data,
        builds: normalizeBuildList(response.data),
      };
    } catch (e) {
      return { builds: MOCK_BUILDS, has_more: false };
    }
  },

  getFeatured: async () => {
    try {
      const response = await api.get("/builds/featured");
      return normalizeBuildList(response.data);
    } catch {
      return MOCK_BUILDS;
    }
  },

  like: async (id) => {
    try {
      const response = await api.post(`/builds/${id}/like`);
      return {
        ...response.data,
        build: normalizeBuild(response.data?.build),
      };
    } catch {
      return { success: true };
    }
  },

  clone: async (id) => {
    try {
      const response = await api.post(`/builds/${id}/clone`);
      return {
        ...response.data,
        build: normalizeBuild(response.data?.build),
      };
    } catch (e) {
      const mock = MOCK_BUILDS.find((build) => String(build.id) === String(id));
      if (mock)
        return {
          success: true,
          build: { ...mock, id: `cloned-${Date.now()}` },
        };
      throw e;
    }
  },
};

export const chatAPI = {
  sendMessage: async (
    message,
    sessionId = "default",
    memorySnapshot = null,
    buildContext = null,
    options = {},
  ) => {
    const mode = options.mode === "assistant" ? "assistant" : "general";
    const userTier = options.userTier || "free";
    const rawUseCase = options.useCase || buildContext?.useCase || null;
    const resolvedUseCase = rawUseCase
      ? String(rawUseCase).toLowerCase().includes("stream")
        ? "streaming"
        : String(rawUseCase).toLowerCase().includes("work")
          ? "work"
          : String(rawUseCase).toLowerCase().includes("game")
            ? "gaming"
            : rawUseCase
      : null;

    if (FEATURES.MOCK_ALL_APIS) {
      if (mode === "general") {
        return buildLocalGeneralResponse(message, buildContext);
      }
      return attachRecommendationRationales(
        generateSmartResponse(message, {
          currentBuild: buildContext,
          useCase: resolvedUseCase,
        }),
      );
    }

    const userContext = {
      ...(options.userContext || {}),
      locale: options.locale,
      tier: userTier,
    };
    if (resolvedUseCase) {
      userContext.useCase = resolvedUseCase;
    }
    if (options.requestType || options.userContext?.requestType) {
      userContext.requestType =
        options.requestType || options.userContext?.requestType;
    }
    const budgetMatch = message.match(/\$(\d{1,5})/);
    if (budgetMatch) {
      userContext.budget = Number.parseInt(budgetMatch[1], 10);
    }

    if (buildContext?.parts) {
      userContext.hasCurrentBuild = true;
      userContext.hasGpu = Boolean(buildContext.parts.gpu);
      userContext.existingParts = {};
      Object.entries(buildContext.parts).forEach(([category, part]) => {
        if (part?.name) {
          userContext.existingParts[category] = part.name;
        }
      });
    }

    const messages = [];
    if (memorySnapshot?.conversationHistory) {
      memorySnapshot.conversationHistory.slice(-10).forEach((entry) => {
        messages.push({
          role: entry.role === "user" ? "user" : "assistant",
          content: entry.content,
        });
      });
    }
    messages.push({ role: "user", content: message });

    try {
      const response = await api.post("/chat", {
        sessionId,
        mode,
        userTier,
        messages,
        userContext,
        events: options.events || [],
      });
      const data = response.data;
      const normalized = {
        text: data.message || "",
        response: data.message || "",
        suggestions: data.suggestions || [],
        recommendations: normalizeBuildRecommendations(data.build),
        build: data.build,
      };
      return mode === "assistant"
        ? attachRecommendationRationales(normalized)
        : normalized;
    } catch (e) {
      if (FEATURES.OFFLINE_MODE) {
        const localResponse = await callLocalChatApi(
          message,
          sessionId,
          memorySnapshot,
          {
            mode,
            userContext,
          },
        );
        if (localResponse) {
          const normalized = {
            text: localResponse.message || "",
            response: localResponse.message || "",
            suggestions: localResponse.suggestions || [],
            recommendations: normalizeBuildRecommendations(localResponse.build),
            build: localResponse.build,
          };
          return mode === "assistant"
            ? attachRecommendationRationales(normalized)
            : normalized;
        }
      }

      console.warn("Chat API failed, using smart mock:", e.message);
      try {
        if (mode === "general") {
          return buildLocalGeneralResponse(message, buildContext);
        }
        const smartResponse = generateSmartResponse(message, {
          currentBuild: buildContext,
          useCase: resolvedUseCase,
        });
        return attachRecommendationRationales(
          smartResponse || {
            text: "I had trouble processing that. Please try again.",
            suggestions: [],
          },
        );
      } catch (smartMockError) {
        console.error("Nexus AI logic error:", smartMockError);
        return {
          text: "Sorry, I encountered an error. Please try again with a simpler question.",
          suggestions: ["Build me a gaming PC", "What GPU should I get?"],
        };
      }
    }
  },

  streamMessage: async (
    message,
    sessionId = "default",
    onChunk,
    onError,
    memorySnapshot = null,
    buildContext = null,
    options = {},
  ) => {
    try {
      const response = await chatAPI.sendMessage(
        message,
        sessionId,
        memorySnapshot,
        buildContext,
        options,
      );
      await simulateStreamingResponse(
        response.text || response.response || "",
        onChunk,
        response.suggestions,
      );
    } catch (error) {
      if (onError) onError(error);
      if (options.mode === "general") {
        const response = buildLocalGeneralResponse(message, buildContext);
        await simulateStreamingResponse(
          response.text,
          onChunk,
          response.suggestions,
        );
        return;
      }
      const response = generateSmartResponse(message, {
        currentBuild: buildContext,
      });
      await simulateStreamingResponse(
        response.text,
        onChunk,
        response.suggestions,
      );
    }
  },

  clearConversation: async () => ({ success: true }),

  validateBuild: async (components) => {
    const presentComponents = Object.entries(components || {}).filter(
      ([, value]) => Boolean(value),
    );
    return {
      valid: presentComponents.length >= 2,
      suggestions:
        presentComponents.length >= 2
          ? []
          : ["Add at least a CPU and GPU to validate this build."],
      compatibility:
        presentComponents.length >= 2
          ? "Checked with NexusBuild local validator"
          : "Incomplete build",
    };
  },

  getBudgetAllocation: async (
    budget,
    useCase = "gaming",
    resolution = "1440p",
  ) => ({
    ...computeBudgetAllocation(budget, useCase),
    resolution,
  }),
};

export const healthCheck = async () => {
  try {
    const response = await api.get("/health");
    return response.data;
  } catch {
    return { status: "offline", mockMode: true };
  }
};

export const reportsAPI = {
  create: async (formData) => {
    try {
      const response = await api.post("/reports", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (e) {
      return { success: true, id: `mock-report-${Date.now()}` };
    }
  },

  getAll: async () => {
    try {
      const response = await api.get("/reports");
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      return [];
    }
  },

  getMyReports: async () => {
    try {
      const response = await api.get("/reports/my");
      return Array.isArray(response.data) ? response.data : [];
    } catch (e) {
      console.warn("Failed to fetch user reports from API:", e.message);
      return [];
    }
  },
};

export const adminAPI = {
  getStats: async () => {
    try {
      const response = await api.get("/admin/stats");
      return response.data;
    } catch (e) {
      if (e.response?.status === 401 || e.response?.status === 404) {
        return {};
      }
      console.error("Admin stats failed:", e.message);
      return {};
    }
  },

  getUsers: async () => {
    try {
      const response = await api.get("/admin/users");
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      return [];
    }
  },

  updateUser: async (id, updates) => {
    const response = await api.patch(`/admin/users/${id}`, updates);
    return response.data;
  },

  getBuilds: async () => {
    try {
      const response = await api.get("/admin/builds");
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      return [];
    }
  },

  deleteBuild: async (id) => {
    const response = await api.delete(`/admin/builds/${id}`);
    return response.data;
  },

  getParts: async () => {
    try {
      const response = await api.get("/admin/parts");
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      return [];
    }
  },

  getReports: async () => {
    try {
      const response = await api.get("/reports");
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      return [];
    }
  },

  updateReport: async (id, updates) => {
    const response = await api.patch(`/reports/${id}`, updates);
    return response.data;
  },

  deleteReport: async (id) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },
};

export const userAPI = {
  getMe: async () => {
    try {
      const response = await api.get("/auth/me");
      return normalizeUser(response.data);
    } catch (e) {
      console.warn(
        "Network error getting user, returning mock user:",
        e.message,
      );
      return normalizeUser(MOCK_USER);
    }
  },

  onboard: async (handle) => ({
    ...normalizeUser(MOCK_USER),
    username: handle,
    displayName: handle,
  }),

  updateProfile: async (data) => {
    const response = await api.put("/auth/update", data);
    return normalizeUser(response.data?.user || response.data);
  },
};

export const linksAPI = {
  getAll: async () => MOCK_LINKS,
};

export default api;
