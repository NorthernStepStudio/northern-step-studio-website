const CATEGORY_ALIASES = {
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
  "internal hard drive": "storage",
  ssd: "storage",
  hdd: "storage",
  nvme: "storage",
  psu: "psu",
  "power supply": "psu",
  case: "case",
  cooler: "cooler",
  fan: "fan",
  monitor: "monitor",
  keyboard: "keyboard",
  mouse: "mouse",
  headset: "headset",
  headphones: "headset",
  accessory: "accessory",
  os: "os",
};

const safeDecode = (value) => {
  try {
    return decodeURIComponent(String(value ?? "").replace(/\+/g, "%20"));
  } catch {
    return String(value ?? "");
  }
};

const normalizeCategory = (value) => {
  if (!value) return "part";
  const normalized = String(value).toLowerCase().replace(/[_-]+/g, " ").trim();
  return CATEGORY_ALIASES[normalized] || normalized.replace(/\s+/g, "-");
};

export const detectCategoryFromName = (partName) => {
  if (!partName) return "gpu";
  const lower = String(partName).toLowerCase();

  if (/ryzen|intel|core|i[3579]|processor|threadripper/i.test(lower))
    return "cpu";
  if (/rtx|gtx|radeon|rx\s?\d{4}|geforce|quadro|arc\s?a\d/i.test(lower))
    return "gpu";
  if (/motherboard|mobo|z[4-9]\d{2}|b[5-9]\d{2}|x[5-9]\d{2}/i.test(lower))
    return "motherboard";
  if (/ram|memory|ddr[45]/i.test(lower)) return "ram";
  if (/ssd|nvme|storage|hdd|drive/i.test(lower)) return "storage";
  if (/psu|power\s?supply|watt/i.test(lower)) return "psu";
  if (/case|tower|chassis/i.test(lower)) return "case";
  if (/cooler|aio|noctua|liquid/i.test(lower)) return "cooler";
  if (/monitor|display|144hz|ips|oled/i.test(lower)) return "monitor";
  if (/keyboard|mechanical|switch|keycap/i.test(lower)) return "keyboard";
  if (/mouse|dpi|wireless/i.test(lower)) return "mouse";
  return "gpu";
};

export const parseChatLink = (url) => {
  if (!url) return null;

  const value = String(url).trim();
  if (!value.startsWith("nexus://")) return null;

  if (value.startsWith("nexus://part/")) {
    const partName = safeDecode(value.slice("nexus://part/".length));
    return {
      type: "part",
      category: detectCategoryFromName(partName),
      partName,
    };
  }

  if (value.startsWith("nexus://search/")) {
    const [rawCategory = "", ...partNameParts] = value
      .slice("nexus://search/".length)
      .split("/");
    const partName = safeDecode(partNameParts.join("/"));
    const category =
      normalizeCategory(safeDecode(rawCategory)) ||
      detectCategoryFromName(partName);
    return {
      type: "search",
      category,
      partName,
    };
  }

  if (value.startsWith("nexus://add/")) {
    const [rawCategory = "", ...partNameParts] = value
      .slice("nexus://add/".length)
      .split("/");
    const partName = safeDecode(partNameParts.join("/"));
    const category =
      normalizeCategory(safeDecode(rawCategory)) ||
      detectCategoryFromName(partName);
    return {
      type: "add",
      category,
      partName,
    };
  }

  if (value.startsWith("nexus://remove/")) {
    const category = normalizeCategory(
      safeDecode(value.slice("nexus://remove/".length)),
    );
    return {
      type: "remove",
      category,
      partName: null,
    };
  }

  return null;
};

export const buildPartSelectionParams = (link) => ({
  category: link?.category || detectCategoryFromName(link?.partName),
  categoryName: link?.partName || null,
  searchQuery: link?.partName || "",
});

export const handleChatLinkPress = async (url, navigation, options = {}) => {
  const link = parseChatLink(url);
  if (!link) return false;

  const rootNavigation = navigation?.getParent?.() || navigation;

  if (link.type === "remove") {
    if (typeof options.removePart === "function") {
      await options.removePart(link.category);
      return true;
    }

    rootNavigation?.navigate("BuilderTab", { screen: "BuilderMain" });
    return true;
  }

  rootNavigation?.navigate("HomeTab", {
    screen: "PartSelection",
    params: buildPartSelectionParams(link),
  });
  return true;
};
