/**
 * 🤖 DOMAIN: AI Branch
 *
 * Nexus AI Response Generator
 * SINGLE SOURCE OF TRUTH for all AI response logic.
 *
 * Capabilities:
 * - Context-aware component recommendations
 * - Multi-category build generation (Gaming, Work, Streaming)
 * - Educational "Why" explanations
 * - Budget optimization
 * - Conversation memory (multi-turn context)
 * - Semantic understanding (synonym groups)
 * - Entity extraction (GPUs, CPUs, budgets, games)
 */

import { formatPrice } from "../../core/helpers";
import { resolveBenchmarkScore } from "../../core/performanceScore";
import {
  searchParts,
  formatPartInfo,
  ALL_PARTS,
  getKnowledgeStats,
  TERMINOLOGY,
  TROUBLESHOOTING,
  COMPATIBILITY,
  UPGRADE_ADVICE,
  RESPONSE_PATTERNS,
  BUILD_ARCHETYPES,
  GAME_FPS_DATA,
  COMMON_MISTAKES,
  PRO_TIPS,
  GUIDE_KNOWLEDGE,
  SYNONYM_MAP,
  WORKSTATION_KNOWLEDGE,
  MONITOR_KNOWLEDGE,
  PSU_KNOWLEDGE,
  AUDIO_KNOWLEDGE,
  PERIPHERALS_DEEP_DIVE,
  PREBUILT_KNOWLEDGE,
  LAPTOP_KNOWLEDGE,
  ROAST_LOGIC,
} from "./knowledge";

// Import compatibility checker for build analysis
import { checkCompatibility } from "../builds";

// Import conversation memory module
import memory, {
  resetMemory,
  processMessage,
  setAwaiting,
  isAnsweringQuestion,
  detectsComponent,
  getMemory,
  storeExtractedEntities,
} from "./conversationMemory";

// Import analytics for tracking AI performance
import { logPatternMatch, logFallback, getAnalyticsReport } from "./analytics";
import { normalizeUserMessage } from "./synonyms";

// Re-export for ChatUIContext
export const resetConversationContext = resetMemory;

// Re-export analytics report for use in chat
export { getAnalyticsReport };

// === 📊 ANALYTICS HELPER ===
// Helper to create a response with analytics tracking
let _lastUserMessage = "";
let _lastExtractedEntities = null;

const buildEntityConfirmation = (entities = {}) => {
  if (!entities || typeof entities !== "object") return null;
  const parts = [];
  if (entities.budget) parts.push(`Budget: $${entities.budget}`);
  if (entities.useCase) parts.push(`Use: ${entities.useCase}`);
  if (entities.resolution) parts.push(`Target: ${entities.resolution}`);
  if (entities.gpu) parts.push(`GPU: ${entities.gpu}`);
  if (entities.cpu) parts.push(`CPU: ${entities.cpu}`);
  if (entities.games?.length) parts.push(`Games: ${entities.games.join(", ")}`);
  if (!parts.length) return null;
  return `Just to confirm, I caught: ${parts.join(" • ")}. Does that look right?`;
};

const appendEntityConfirmation = (response) => {
  if (!response?.text) return response;
  const confirmation = buildEntityConfirmation(_lastExtractedEntities);
  if (!confirmation) return response;
  return { ...response, text: `${response.text}\n\n${confirmation}` };
};

const trackedResponse = (patternName, response) => {
  logPatternMatch(patternName, _lastUserMessage);
  return appendEntityConfirmation(response);
};

// Get synonyms for a group from the dictionary
const getSynonymGroup = (group) => {
  const { SYNONYM_DICTIONARY } = require("./synonyms");
  return SYNONYM_DICTIONARY[group] || [];
};

// Check if message contains any synonym from a group
// Check if message contains any synonym from a group
const matchesSynonymGroup = (message, group) => {
  const lower = message.toLowerCase();
  const { getFuzzyMatch, SYNONYM_DICTIONARY } = require("./synonyms");
  const synonyms = SYNONYM_DICTIONARY[group] || [];

  // Fast path: direct inclusion
  if (synonyms.some((word) => lower.includes(word))) return true;

  // Slow path: fuzzy matching for typos
  for (const synonym of synonyms) {
    if (getFuzzyMatch(message, synonym, 2)) return true;
  }
  return false;
};

// === 🔗 PART LINK HELPERS ===
// Creates clickable markdown links for parts with different actions
// Protocol: nexus://{action}/{category}/{identifier}

// Category mapping for link generation
const CATEGORY_MAP = {
  cpu: "CPU",
  gpu: "GPU",
  motherboard: "Motherboard",
  ram: "RAM",
  storage: "Storage",
  psu: "PSU",
  case: "Case",
  cooler: "Cooler",
  monitor: "Monitor",
  keyboard: "Keyboard",
  mouse: "Mouse",
};

// Detect category from part name (fallback when category not specified)
const detectCategoryFromName = (partName) => {
  if (!partName) return "gpu";
  const lower = partName.toLowerCase();
  if (/ryzen|intel|core|i[3579]|processor|threadripper/i.test(lower))
    return "cpu";
  if (/rtx|gtx|radeon|rx\s?\d{4}|geforce|quadro|arc\s?a\d/i.test(lower))
    return "gpu";
  if (/motherboard|mobo|z[4-9]\d{2}|b[5-9]\d{2}|x[5-9]\d{2}/i.test(lower))
    return "motherboard";
  if (/ram|memory|ddr[45]/i.test(lower)) return "ram";
  if (/ssd|nvme|storage|hdd|drive/i.test(lower)) return "storage";
  if (/psu|power\s?supply|watt|corsair\s?rm|evga/i.test(lower)) return "psu";
  if (/case|tower|chassis|nzxt|fractal|lian/i.test(lower)) return "case";
  if (/cooler|aio|noctua|hyper\s?212|liquid/i.test(lower)) return "cooler";
  if (/monitor|display|144hz|ips|oled/i.test(lower)) return "monitor";
  if (/keyboard|mechanical|switch|keycap/i.test(lower)) return "keyboard";
  if (/mouse|dpi|wireless/i.test(lower)) return "mouse";
  return "gpu";
};

// Standard part link - navigates to search with part name (backward compatible)
const partLink = (partName, category = null) => {
  if (!partName) return "";
  const encodedName = encodeURIComponent(partName);
  const cat = category || detectCategoryFromName(partName);
  return `[${partName}](nexus://search/${cat}/${encodedName})`;
};

// Add-to-build link - clicking adds the part directly to build
const addPartLink = (partName, category = null) => {
  if (!partName) return "";
  const encodedName = encodeURIComponent(partName);
  const cat = category || detectCategoryFromName(partName);
  return `[➕ Add ${partName}](nexus://add/${cat}/${encodedName})`;
};

// Remove-from-build link - clicking removes the category from build
const removePartLink = (category) => {
  if (!category) return "";
  const displayName = CATEGORY_MAP[category] || category;
  return `[❌ Remove ${displayName}](nexus://remove/${category})`;
};

// === 🎯 ENTITY EXTRACTION ===
// Extract specific entities from user messages
const extractEntities = (message) => {
  const lower = message.toLowerCase();
  const entities = {};

  // Extract budget with range support
  const budgetCueRegex =
    /(budget|spend|spending|usd|dollars|bucks|under|below|less than|over|around|about|approx|approximately|at most|max|up to|limit)/i;
  const hasBudgetCue =
    budgetCueRegex.test(message) || /[$€£]\s*[\d,]{3,6}/.test(message);
  const parseAmount = (value) => parseInt(value.replace(/[$€£,\s]/g, ""), 10);

  if (hasBudgetCue) {
    const rangePatterns = [
      /(?:between|from)\s*[$€£]?\s*([\d,]{3,6})\s*(?:and|to)\s*[$€£]?\s*([\d,]{3,6})/i,
      /[$€£]?\s*([\d,]{3,6})\s*[-–]\s*[$€£]?\s*([\d,]{3,6})/i,
    ];
    for (const pattern of rangePatterns) {
      const match = message.match(pattern);
      if (match) {
        const min = parseAmount(match[1]);
        const max = parseAmount(match[2]);
        entities.budgetMin = Math.min(min, max);
        entities.budgetMax = Math.max(min, max);
        entities.budget = entities.budgetMax;
        break;
      }
    }

    if (!entities.budget) {
      const amountMatches = message.match(/[$€£]?\s*[\d,]{3,6}/g) || [];
      const cleaned = amountMatches
        .map((amount) => parseAmount(amount))
        .filter(Boolean);
      if (cleaned.length) {
        entities.budget = cleaned[0];
        if (cleaned.length > 1) {
          entities.budgetMin = Math.min(...cleaned);
          entities.budgetMax = Math.max(...cleaned);
        }
      }
    }
  }

  // Extract resolution
  if (/8k|4320p/i.test(lower)) entities.resolution = "8K";
  else if (/4k|2160p|uhd/i.test(lower)) entities.resolution = "4K";
  else if (/1440p|2k|qhd/i.test(lower)) entities.resolution = "1440p";
  else if (/1080p|fhd|full\s*hd/i.test(lower)) entities.resolution = "1080p";

  // Extract GPU mentions
  const gpuPatterns = [
    /\brtx\s*\d{4}\s*(ti|super|ti\s*super)?\b/gi,
    /\bgtx\s*\d{3,4}\s*(ti)?\b/gi,
    /\brx\s*\d{3,4}\s*(xt|x|xtx)?\b/gi,
    /\bradeon\s*rx\s*\d{3,4}\s*(xt|x|xtx)?\b/gi,
    /\bgeforce\s*rtx\s*\d{4}\s*(ti|super|ti\s*super)?\b/gi,
    /\bquadro\s*\w+\b/gi,
    /\barc\s*a\d{3}\b/gi,
    /\bintel\s*arc\s*a\d{3}\b/gi,
  ];
  const gpuMatches = [];
  gpuPatterns.forEach((pattern) => {
    const match = message.match(pattern);
    if (match) {
      match.forEach((value) => {
        const normalized = value.replace(/\s+/g, " ").trim().toUpperCase();
        if (!gpuMatches.includes(normalized)) {
          gpuMatches.push(normalized);
        }
      });
    }
  });
  if (gpuMatches.length) {
    entities.gpu = gpuMatches[0];
    entities.gpus = gpuMatches;
  }

  // Extract CPU mentions
  const cpuPatterns = [
    /\bryzen\s*\d\s*\d{4,5}(x3d|x|g|ge)?\b/gi,
    /\bthreadripper\s*\d{4,5}\b/gi,
    /\bi[3579]\s*-?\s*\d{4,5}[a-z]{0,2}\b/gi,
    /\bcore\s*i[3579]\s*-?\s*\d{4,5}[a-z]{0,2}\b/gi,
    /\bcore\s*ultra\s*\d{1,2}\s*\d{3,4}[a-z]{0,2}\b/gi,
  ];
  const cpuMatches = [];
  cpuPatterns.forEach((pattern) => {
    const match = message.match(pattern);
    if (match) {
      match.forEach((value) => {
        const normalized = value.replace(/\s+/g, " ").trim();
        if (!cpuMatches.includes(normalized)) {
          cpuMatches.push(normalized);
        }
      });
    }
  });
  if (cpuMatches.length) {
    entities.cpu = cpuMatches[0];
    entities.cpus = cpuMatches;
  }

  // Extract game mentions
  const games = [
    { name: "cyberpunk 2077", pattern: /\bcyberpunk\b/i },
    { name: "fortnite", pattern: /\bfortnite\b/i },
    { name: "valorant", pattern: /\bvalorant\b/i },
    { name: "counter-strike 2", pattern: /\bcs2\b|\bcounter-?strike 2\b/i },
    { name: "cs:go", pattern: /\bcsgo\b|\bcounter-?strike:?\s*go\b/i },
    { name: "elden ring", pattern: /\belden ring\b/i },
    { name: "hogwarts legacy", pattern: /\bhogwarts\b|\bhogwarts legacy\b/i },
    { name: "starfield", pattern: /\bstarfield\b/i },
    { name: "call of duty", pattern: /\bcall of duty\b|\bcod\b/i },
    { name: "warzone", pattern: /\bwarzone\b/i },
    { name: "apex legends", pattern: /\bapex\b|\bapex legends\b/i },
    { name: "minecraft", pattern: /\bminecraft\b/i },
    { name: "gta", pattern: /\bgta\b|\bgrand theft auto\b/i },
    { name: "overwatch", pattern: /\boverwatch\b/i },
    { name: "league of legends", pattern: /\bleague of legends\b|\blol\b/i },
    { name: "dota 2", pattern: /\bdota 2\b|\bdota\b/i },
    {
      name: "rainbow six siege",
      pattern: /\brainbow six\b|\br6 siege\b|\br6s\b/i,
    },
    { name: "pubg", pattern: /\bpubg\b|\bplayerunknown'?s battlegrounds\b/i },
    {
      name: "escape from tarkov",
      pattern: /\btarkov\b|\bescape from tarkov\b/i,
    },
    { name: "baldur's gate 3", pattern: /\bbaldur'?s gate 3\b|\bbg3\b/i },
  ];
  games.forEach((game) => {
    if (game.pattern.test(message)) {
      if (!entities.games) entities.games = [];
      if (!entities.games.includes(game.name)) {
        entities.games.push(game.name);
      }
    }
  });

  // Extract use case
  if (matchesSynonymGroup(lower, "gaming")) entities.useCase = "gaming";
  else if (matchesSynonymGroup(lower, "streaming"))
    entities.useCase = "streaming";
  else if (matchesSynonymGroup(lower, "work")) entities.useCase = "work";

  return entities;
};

// Generate a short explanation for why a component fits the build context.
export const generateComponentRationale = ({
  category,
  name,
  specs = {},
  context = {},
}) => {
  const useCase = context.useCase || context.type || "gaming";
  const tier = context.tier ? `${context.tier} tier` : "the budget";
  const budgetNote = context.budget
    ? `within ~$${context.budget}`
    : "within the budget";

  switch (category) {
    case "cpu": {
      const coresNote = specs.cores ? `${specs.cores}-core` : "strong";
      if (useCase === "work") {
        return `This ${coresNote} CPU keeps multitasking and productivity apps smooth ${budgetNote}.`;
      }
      if (useCase === "streaming") {
        return `Balanced ${coresNote} performance keeps gameplay and stream encoding steady ${budgetNote}.`;
      }
      return `A ${coresNote} CPU keeps pace with the GPU and avoids bottlenecks for ${useCase} ${tier} builds.`;
    }
    case "gpu": {
      const vramNote = specs.vram ? `${specs.vram} VRAM` : "solid VRAM";
      if (useCase === "work") {
        return `Reliable graphics horsepower and ${vramNote} help creative apps and GPU-accelerated workflows.`;
      }
      if (useCase === "streaming") {
        return `Strong rendering plus ${vramNote} keeps games smooth while streaming.`;
      }
      return `Great ${useCase} performance with ${vramNote} for the ${tier} target.`;
    }
    case "motherboard": {
      const socketNote = specs.socket
        ? `matching the ${specs.socket} socket`
        : "matching the CPU socket";
      const ocNote = specs.oc ? " and supports overclocking" : "";
      return `Chosen for compatibility (${socketNote})${ocNote}, giving stable power delivery and upgrade headroom.`;
    }
    case "ram": {
      const capacityNote = specs.capacity
        ? `${specs.capacity} RAM`
        : "plenty of RAM";
      const speedNote = specs.speed ? ` at ${specs.speed}MHz` : "";
      return `The ${capacityNote}${speedNote} keeps ${useCase} workloads responsive without overspending.`;
    }
    case "storage": {
      const sizeNote = specs.size ? `${specs.size} SSD` : "NVMe SSD";
      return `Fast ${sizeNote} storage speeds up boots, game loads, and project files.`;
    }
    case "cooler": {
      const tdpNote = specs.tdp
        ? `rated for ${specs.tdp}W`
        : "sized for the CPU";
      return `Cooling ${tdpNote} keeps temps under control and preserves boost clocks.`;
    }
    case "psu": {
      const wattageNote = specs.wattage ? `${specs.wattage}W` : "ample wattage";
      const headroomNote = specs.headroom
        ? ` with ${specs.headroom}W headroom`
        : "";
      return `A ${wattageNote} PSU${headroomNote} ensures stable power and future upgrade room.`;
    }
    case "case":
      return `An airflow-focused case keeps components cool and leaves room for upgrades.`;
    default:
      return `Selected to balance performance and value for your ${useCase} goals.`;
  }
};

const parseRamSpecs = (ramType) => {
  if (!ramType) return {};
  const capacityMatch = ramType.match(/(\d+GB)/i);
  const speedMatch = ramType.match(/(\d+)\s?MHz/i);
  const generationMatch = ramType.match(/DDR\d/i);
  return {
    capacity: capacityMatch ? capacityMatch[1] : undefined,
    speed: speedMatch ? speedMatch[1] : undefined,
    generation: generationMatch ? generationMatch[0] : undefined,
  };
};

// === 💸 BUDGET ALLOCATION HELPERS ===
// Rule-based allocation targets by use case (percent ranges)
const BASE_ALLOCATION_TARGETS = {
  gaming: {
    gpu: [0.35, 0.45],
    cpu: [0.18, 0.25],
    motherboard: [0.08, 0.12],
    ram: [0.06, 0.1],
    storage: [0.06, 0.1],
    psu: [0.05, 0.08],
    case: [0.04, 0.07],
    cooler: [0.03, 0.06],
  },
  streaming: {
    gpu: [0.3, 0.4],
    cpu: [0.2, 0.28],
    motherboard: [0.08, 0.12],
    ram: [0.08, 0.12],
    storage: [0.08, 0.12],
    psu: [0.05, 0.08],
    case: [0.04, 0.07],
    cooler: [0.04, 0.07],
  },
  work: {
    cpu: [0.3, 0.4],
    gpu: [0.15, 0.25],
    motherboard: [0.08, 0.12],
    ram: [0.1, 0.15],
    storage: [0.08, 0.12],
    psu: [0.05, 0.08],
    case: [0.04, 0.07],
    cooler: [0.04, 0.07],
  },
};

const clampPercent = (value) => Math.max(0, Math.min(1, value));

const adjustAllocationRange = (range, minDelta, maxDelta) => {
  const [min, max] = range;
  return [clampPercent(min + minDelta), clampPercent(max + maxDelta)];
};

export const getBudgetAllocationTargets = ({
  budget = null,
  useCase = "gaming",
  resolution = "1440p",
} = {}) => {
  const base =
    BASE_ALLOCATION_TARGETS[useCase] || BASE_ALLOCATION_TARGETS.gaming;
  const targets = { ...base };

  if (useCase === "gaming") {
    if (/4k/i.test(resolution)) {
      targets.gpu = adjustAllocationRange(targets.gpu, 0.05, 0.05);
      targets.cpu = adjustAllocationRange(targets.cpu, -0.03, -0.03);
    } else if (/1080p/i.test(resolution)) {
      targets.cpu = adjustAllocationRange(targets.cpu, 0.02, 0.02);
      targets.gpu = adjustAllocationRange(targets.gpu, -0.02, -0.02);
    }
  }

  return Object.entries(targets).reduce((acc, [component, [min, max]]) => {
    const minAmount = budget ? Math.round(budget * min) : null;
    const maxAmount = budget ? Math.round(budget * max) : null;
    acc[component] = {
      minPercent: min,
      maxPercent: max,
      minAmount,
      maxAmount,
    };
    return acc;
  }, {});
};

const formatBudgetSummaryLine = (budget, total) => {
  if (!budget || !total) return "";
  const delta = budget - total;
  const status =
    delta >= 0
      ? `${formatPrice(delta)} remaining`
      : `${formatPrice(Math.abs(delta))} over budget`;
  return `**Budget:** ${formatPrice(total)} • ${status}`;
};

// === 📝 UPDATE CONTEXT ===
// Merge new entities into conversation context
const updateContext = (entities) => {
  const addMentionedPart = (part) => {
    if (!part) return;
    if (!conversationContext.mentionedParts.includes(part)) {
      conversationContext.mentionedParts.push(part);
    }
  };
  if (entities.budget) conversationContext.budget = entities.budget;
  if (entities.resolution) conversationContext.resolution = entities.resolution;
  if (entities.useCase) conversationContext.useCase = entities.useCase;
  if (entities.gpu) addMentionedPart(entities.gpu);
  if (entities.gpus) entities.gpus.forEach(addMentionedPart);
  if (entities.cpu) addMentionedPart(entities.cpu);
  if (entities.cpus) entities.cpus.forEach(addMentionedPart);
  if (entities.games) {
    entities.games.forEach((game) => {
      if (!conversationContext.mentionedGames.includes(game)) {
        conversationContext.mentionedGames.push(game);
      }
    });
  }
  conversationContext.turnCount++;
};

// --- 🧠 ENHANCED KNOWLEDGE BASE ---
// Includes socket info, OC capability, and pairing recommendations
const KNOWLEDGE_BASE = {
  cpus: {
    budget: {
      name: "Intel i3-14100F",
      price: 119,
      score: 65,
      cores: 4,
      socket: "LGA1700",
      unlocked: false,
      tdp: 58,
      cooler: "Stock included",
    },
    mid: {
      name: "AMD Ryzen 5 9600X",
      price: 279,
      score: 92,
      cores: 6,
      socket: "AM5",
      unlocked: true,
      tdp: 65,
      cooler: "Stock included",
    },
    high: {
      name: "AMD Ryzen 7 9800X3D",
      price: 479,
      score: 110,
      cores: 8,
      socket: "AM5",
      unlocked: true,
      tdp: 120,
      cooler: "Tower cooler recommended",
    },
    // Budget workstation - good multi-core at low price
    workBudget: {
      name: "AMD Ryzen 9 5900X",
      price: 260,
      score: 85,
      cores: 12,
      socket: "AM4",
      unlocked: true,
      tdp: 105,
      cooler: "Tower cooler required",
    },
    // Pro workstation - maximum cores
    workPro: {
      name: "AMD Ryzen 9 9950X",
      price: 649,
      score: 120,
      cores: 16,
      socket: "AM5",
      unlocked: true,
      tdp: 170,
      cooler: "AIO 360mm recommended",
    },
  },
  gpus: {
    budget: {
      name: "RX 7600",
      price: 250,
      vram: "8GB",
      tier: "1080p",
      tdp: 165,
    },
    mid: {
      name: "RTX 4060 Ti",
      price: 380,
      vram: "16GB",
      tier: "1080p Ultra",
      tdp: 160,
    },
    high: {
      name: "RTX 5070",
      price: 549,
      vram: "12GB",
      tier: "1440p",
      tdp: 220,
    },
    ultra: { name: "RTX 5080", price: 999, vram: "16GB", tier: "4K", tdp: 360 },
    flagship: {
      name: "RTX 5090",
      price: 1999,
      vram: "32GB",
      tier: "4K/8K",
      tdp: 575,
    },
  },
  motherboards: {
    budget: { name: "B760 (Intel) / B650 (AMD)", price: 130, oc: false },
    mid: { name: "B760 WiFi / B650 WiFi", price: 180, oc: false },
    high: { name: "Z890 / X870", price: 280, oc: true },
    ultra: { name: "Z890 Hero / X870E", price: 500, oc: true },
  },
  coolers: {
    stock: { name: "Stock Cooler", price: 0, tdp: 65 },
    budget: { name: "DeepCool AK400", price: 30, tdp: 180 },
    mid: { name: "Thermalright Peerless Assassin", price: 45, tdp: 240 },
    high: { name: "Arctic LF III 240mm", price: 100, tdp: 280 },
    ultra: { name: "Arctic LF III 360mm", price: 140, tdp: 350 },
  },
  psu: {
    budget: { name: "650W Bronze", price: 60, wattage: 650 },
    mid: { name: "750W Gold", price: 90, wattage: 750 },
    high: { name: "850W Gold ATX 3.0", price: 120, wattage: 850 },
    ultra: { name: "1000W+ Gold ATX 3.0", price: 180, wattage: 1000 },
  },
  cases: {
    budget: {
      name: "Deepcool CC560",
      price: 60,
      size: "ATX",
      airflow: "Good",
      maxGpuLength: 370,
    },
    mid: {
      name: "NZXT H5 Flow",
      price: 90,
      size: "ATX",
      airflow: "Excellent",
      maxGpuLength: 365,
    },
    high: {
      name: "Lian Li Lancool 216",
      price: 110,
      size: "ATX",
      airflow: "Best in Class",
      maxGpuLength: 392,
    },
    ultra: {
      name: "Lian Li O11 Dynamic EVO XL",
      price: 240,
      size: "E-ATX",
      airflow: "Showcase",
      maxGpuLength: 460,
    },
    itx: {
      name: "Lian Li A4-H2O",
      price: 150,
      size: "ITX",
      airflow: "Good",
      maxGpuLength: 322,
    },
  },
  monitors: {
    budget: {
      name: "1080p 180Hz IPS",
      price: 130,
      resolution: "1080p",
      refreshRate: 180,
      panel: "IPS",
    },
    mid: {
      name: "1440p 180Hz IPS",
      price: 250,
      resolution: "1440p",
      refreshRate: 180,
      panel: "IPS",
    },
    high: {
      name: "1440p 240Hz OLED",
      price: 650,
      resolution: "1440p",
      refreshRate: 240,
      panel: "OLED",
    },
    ultra: {
      name: "4K 240Hz OLED",
      price: 1100,
      resolution: "4K",
      refreshRate: 240,
      panel: "QD-OLED",
    },
    ultrawide: {
      name: '34" OLED UWQHD',
      price: 800,
      resolution: "Ultrawide 1440p",
      refreshRate: 175,
      panel: "QD-OLED",
    },
  },
  peripherals: {
    keyboard: {
      budget: { name: "Royal Kludge RK61", price: 50 },
      mid: { name: "Keychron V1 Max", price: 90 },
      high: { name: "Wooting 60HE+", price: 175 },
    },
    mouse: {
      budget: { name: "VGN Dragonfly F1", price: 40 },
      mid: { name: "Pulsar X2V2", price: 90 },
      high: { name: "Razer Viper V3 Pro", price: 160 },
    },
  },
};

/**
 * Get a better component based on current component in build
 * @param {string} componentType - 'cpu', 'gpu', etc.
 * @param {object} currentComponent - The user's current component
 * @param {number} budget - Optional budget constraint
 * @returns {object} - Better component recommendation
 */
const getBetterComponent = (componentType, currentComponent, budget = null) => {
  if (!currentComponent) return null;

  const currentName = currentComponent.name || currentComponent.title || "";
  const currentPrice = currentComponent.price || 0;

  // CPU upgrades based on current CPU
  if (componentType === "cpu") {
    const cpuUpgrades = {
      // Budget tier -> Mid tier
      i3: {
        name: "AMD Ryzen 5 7600",
        price: 199,
        advantage: "more cores (6 vs 4) and better multitasking",
      },
      "ryzen 3": {
        name: "AMD Ryzen 5 9600X",
        price: 279,
        advantage: "huge Zen 5 performance jump",
      },
      "ryzen 5 5600": {
        name: "AMD Ryzen 5 9600X",
        price: 279,
        advantage: "newer AM5 platform with DDR5 support",
      },
      "i5-12": {
        name: "Intel i5-14600K",
        price: 319,
        advantage: "more cores and overclocking support",
      },
      "i5-13": {
        name: "Intel Core Ultra 7 265K",
        price: 394,
        advantage: "newer architecture and better efficiency",
      },
      // Mid tier -> High tier
      "ryzen 5 7600": {
        name: "AMD Ryzen 7 9800X3D",
        price: 479,
        advantage: "3D V-Cache + Zen 5 for ultimate gaming",
      },
      "ryzen 5 9600x": {
        name: "AMD Ryzen 7 9800X3D",
        price: 479,
        advantage: "3D V-Cache + Zen 5 for ultimate gaming",
      },
      "i5-14": {
        name: "AMD Ryzen 7 9800X3D",
        price: 479,
        advantage: "Best gaming CPU available",
      },
      // High tier -> Ultra tier
      "ryzen 7 7800x3d": {
        name: "AMD Ryzen 9 9950X",
        price: 649,
        advantage: "more cores for streaming and productivity",
      },
      "ryzen 7 9800x3d": {
        name: "AMD Ryzen 9 9950X",
        price: 649,
        advantage: "more cores for streaming and productivity",
      },
      "i7-14": {
        name: "Intel Core Ultra 9 285K",
        price: 589,
        advantage: "latest Arrow Lake architecture",
      },
    };

    for (const [key, upgrade] of Object.entries(cpuUpgrades)) {
      if (currentName.toLowerCase().includes(key)) {
        if (!budget || upgrade.price <= budget) {
          return upgrade;
        }
      }
    }

    if (/9950x|285k|5090/i.test(currentName)) {
      return null;
    }

    // Default upgrade suggestion
    return {
      name: "AMD Ryzen 7 9800X3D",
      price: 479,
      advantage: "best gaming performance with new 3D V-Cache",
    };
  }

  // GPU upgrades based on current GPU
  if (componentType === "gpu") {
    const gpuUpgrades = {
      // Old GPUs
      "gtx 1060": {
        name: "RTX 4060",
        price: 299,
        advantage: "3x faster with DLSS 3 and ray tracing",
      },
      "gtx 1070": {
        name: "RTX 4060 Ti",
        price: 380,
        advantage: "2x faster with modern features",
      },
      "gtx 1080": {
        name: "RTX 4070 Super",
        price: 599,
        advantage: "2x faster with DLSS 3",
      },
      "rtx 2060": {
        name: "RTX 4060",
        price: 299,
        advantage: "40% faster with DLSS 3",
      },
      "rtx 2070": {
        name: "RTX 4070",
        price: 529,
        advantage: "50% faster with better ray tracing",
      },
      "rtx 2080": {
        name: "RTX 5070",
        price: 549,
        advantage: "Next-gen performance leap",
      },
      "rtx 3060": {
        name: "RTX 4070 Super",
        price: 599,
        advantage: "massive 1440p upgrade",
      },
      "rtx 3070": {
        name: "RTX 5070",
        price: 549,
        advantage: "next-gen Blackwell architecture",
      },
      "rtx 3080": {
        name: "RTX 5080",
        price: 999,
        advantage: "significant 4K performance boost",
      },
      // Current gen upgrades
      "rtx 4060": {
        name: "RTX 5070",
        price: 549,
        advantage: "next-gen 1440p performance",
      },
      "rtx 4070": {
        name: "RTX 5080",
        price: 999,
        advantage: "huge leap for 4K gaming",
      },
      "rtx 4070 super": {
        name: "RTX 5080",
        price: 999,
        advantage: "true 4K/UHD upgrade",
      },
      "rtx 4080": {
        name: "RTX 5090",
        price: 1999,
        advantage: "the ultimate GPU upgrade",
      },
      "rtx 5070": {
        name: "RTX 5080",
        price: 999,
        advantage: "a major step up for 4K gaming",
      },
      "rtx 5080": {
        name: "RTX 5090",
        price: 1999,
        advantage: "the ultimate GPU upgrade",
      },
      // AMD
      "rx 6600": {
        name: "RX 7600 XT",
        price: 329,
        advantage: "better 1080p/1440p performance",
      },
      "rx 6650 xt": {
        name: "RTX 4060 Ti",
        price: 380,
        advantage: "better 1080p Ultra performance",
      },
      "rx 6700": {
        name: "RX 7800 XT",
        price: 479,
        advantage: "50% faster, great for 1440p",
      },
      "rx 7600": {
        name: "RX 7800 XT",
        price: 499,
        advantage: "strong 1440p jump with extra VRAM",
      },
      "rx 7800": {
        name: "RX 7900 XT",
        price: 699,
        advantage: "more 4K headroom and 20GB VRAM",
      },
      "rx 7900": {
        name: "RTX 5090",
        price: 1999,
        advantage: "unbeatable flagship performance",
      },
    };

    for (const [key, upgrade] of Object.entries(gpuUpgrades)) {
      if (currentName.toLowerCase().includes(key)) {
        if (!budget || upgrade.price <= budget) {
          return upgrade;
        }
      }
    }
    if (/5090/i.test(currentName)) {
      return null;
    }

    // Default upgrade
    return {
      name: "RTX 5070",
      price: 549,
      advantage: "excellent value next-gen GPU",
    };
  }

  // Cooler upgrades
  if (componentType === "cooler") {
    const coolerUpgrades = {
      stock: {
        name: "Hyper 212",
        price: 35,
        advantage: "much better thermals and quieter operation",
      },
      "hyper 212": {
        name: "AK620",
        price: 55,
        advantage: "handles hotter CPUs with dual tower design",
      },
      ak620: {
        name: "AIO 240mm",
        price: 100,
        advantage: "liquid cooling for OC headroom and aesthetics",
      },
      peerless: {
        name: "AIO 240mm",
        price: 100,
        advantage: "liquid cooling for better sustained loads",
      },
      "arctic lf iii 240": {
        name: "Arctic LF III 360mm",
        price: 140,
        advantage: "more thermal headroom for higher boost clocks",
      },
      "aio 240": {
        name: "AIO 360mm",
        price: 150,
        advantage: "maximum cooling for high-TDP CPUs",
      },
    };

    for (const [key, upgrade] of Object.entries(coolerUpgrades)) {
      if (currentName.toLowerCase().includes(key)) {
        if (!budget || upgrade.price <= budget) {
          return upgrade;
        }
      }
    }
    return {
      name: "AK620",
      price: 55,
      advantage: "excellent air cooling for most CPUs",
    };
  }

  // PSU upgrades
  if (componentType === "psu") {
    const psuUpgrades = {
      "650w": {
        name: "750W Gold",
        price: 90,
        advantage: "more headroom for modern GPUs",
      },
      "750w": {
        name: "850W Gold ATX 3.0",
        price: 120,
        advantage: "better headroom for high-end GPUs",
      },
      "850w": {
        name: "1000W+ Gold ATX 3.0",
        price: 180,
        advantage: "future-proof power for flagship GPUs",
      },
      "1000w": {
        name: "1000W+ Gold ATX 3.0",
        price: 180,
        advantage: "future-proof power for flagship GPUs",
      },
    };

    for (const [key, upgrade] of Object.entries(psuUpgrades)) {
      if (currentName.toLowerCase().includes(key)) {
        if (!budget || upgrade.price <= budget) {
          return upgrade;
        }
      }
    }

    return {
      name: "850W Gold ATX 3.0",
      price: 120,
      advantage: "strong headroom for performance builds",
    };
  }

  // Case upgrades
  if (componentType === "case") {
    const caseUpgrades = {
      budget: {
        name: "Phanteks P400A",
        price: 90,
        advantage: "better airflow and build quality",
      },
      p400a: {
        name: "Lian Li Lancool II Mesh",
        price: 120,
        advantage: "premium build quality and modularity",
      },
      lancool: {
        name: "Lian Li O11 Dynamic EVO",
        price: 170,
        advantage: "showpiece case with incredible cooling potential",
      },
      nr200: {
        name: "Lian Li A4-H2O",
        price: 200,
        advantage: "premium ITX with AIO support",
      },
    };

    for (const [key, upgrade] of Object.entries(caseUpgrades)) {
      if (currentName.toLowerCase().includes(key)) {
        if (!budget || upgrade.price <= budget) {
          return upgrade;
        }
      }
    }
    return {
      name: "Phanteks P400A",
      price: 90,
      advantage: "excellent airflow at a fair price",
    };
  }

  // Monitor upgrades
  if (componentType === "monitor") {
    const monitorUpgrades = {
      "1080p 60": {
        name: "1080p 144Hz IPS",
        price: 150,
        advantage: "smoother gaming with high refresh rate",
      },
      "1080p 144": {
        name: "1440p 165Hz IPS",
        price: 280,
        advantage: "sharper image with more screen real estate",
      },
      "1440p 144": {
        name: "1440p 240Hz IPS",
        price: 400,
        advantage: "competitive edge with faster refresh",
      },
      "1440p 165": {
        name: "1440p 240Hz IPS",
        price: 400,
        advantage: "faster response for competitive gaming",
      },
      "1440p 240": {
        name: "4K 144Hz IPS",
        price: 700,
        advantage: "maximum clarity for immersive gaming",
      },
    };

    for (const [key, upgrade] of Object.entries(monitorUpgrades)) {
      if (currentName.toLowerCase().includes(key)) {
        if (!budget || upgrade.price <= budget) {
          return upgrade;
        }
      }
    }
    return {
      name: "1440p 165Hz IPS",
      price: 280,
      advantage: "the sweet spot for gaming monitors",
    };
  }

  return null;
};

/**
 * Suggest better CPU and GPU based on budget and current build
 * @param {number} budget - Total budget for upgrades
 * @param {object} currentBuild - User's current build data
 * @returns {object} - Recommendations for CPU and GPU
 */
const suggestBetterCpuGpu = (budget, currentBuild) => {
  const cpu = currentBuild?.parts?.cpu;
  const gpu = currentBuild?.parts?.gpu;

  const betterCpu = getBetterComponent("cpu", cpu, budget * 0.4); // 40% of budget for CPU
  const betterGpu = getBetterComponent("gpu", gpu, budget * 0.6); // 60% of budget for GPU

  return { cpu: betterCpu, gpu: betterGpu };
};

/**
 * Get upgrade advantage text for a component
 * @param {string} componentType - 'cpu' or 'gpu'
 * @param {object} upgrade - The upgrade component
 * @returns {string} - Advantage description
 */
const getUpgradeAdvantage = (componentType, upgrade) => {
  if (!upgrade) return "better performance";
  return upgrade.advantage || "higher performance";
};

// --- 🎯 INTENT PARSER ---
const parseIntent = (message) => {
  const lower = message.toLowerCase();
  const normalized = lower.replace(/,/g, "");
  const toNumber = (value) => {
    if (!value) return null;
    const trimmed = String(value).replace(/,/g, "");
    if (/k$/i.test(trimmed)) return Math.round(parseFloat(trimmed) * 1000);
    if (/^\d+(\.\d+)?$/.test(trimmed)) return Math.round(parseFloat(trimmed));
    return null;
  };

  // Smart budget detection - avoid product model numbers
  // Match: "$1500", "1500 dollars", "budget of 1500", "spend 1.5k", "900-1300"
  // Don't match: "M4000", "RTX 4070", "i7-14700K"
  let budget = null;

  const rangeMatch = normalized.match(
    /(?:between|from)?\s*\$?(\d{1,2}(?:\.\d)?k|\d{3,6})\s*(?:-|to|and)\s*\$?(\d{1,2}(?:\.\d)?k|\d{3,6})/,
  );
  if (rangeMatch) {
    const low = toNumber(rangeMatch[1]);
    const high = toNumber(rangeMatch[2]);
    if (low && high) budget = Math.round((low + high) / 2);
  }

  const dollarMatch = message.match(/\$\s?(\d{1,2}(?:\.\d)?k|\d{3,6})/i);
  if (!budget && dollarMatch) {
    budget = toNumber(dollarMatch[1]);
  }

  const currencyMatch = normalized.match(
    /(\d{1,2}(?:\.\d)?k|\d{3,6})\s*(?:usd|dollars?|bucks)/i,
  );
  if (!budget && currencyMatch) {
    budget = toNumber(currencyMatch[1]);
  }

  const capMatch = normalized.match(
    /(?:under|below|less than|up to|max(?:imum)?|no more than|cap(?:ped)? at)\s*\$?(\d{1,2}(?:\.\d)?k|\d{3,6})/,
  );
  if (!budget && capMatch) {
    budget = toNumber(capMatch[1]);
  }

  const minMatch = normalized.match(
    /(?:over|above|more than|at least|min(?:imum)?)\s*\$?(\d{1,2}(?:\.\d)?k|\d{3,6})/,
  );
  if (!budget && minMatch) {
    budget = toNumber(minMatch[1]);
  }

  const contextMatch = normalized.match(
    /(?:budget|spend|spending|dollars?|usd|cost|price|range|around|about|roughly|ballpark)\s*(?:of|is|around|about|:)?\s*\$?(\d{1,2}(?:\.\d)?k|\d{3,6})/i,
  );
  if (!budget && contextMatch) {
    budget = toNumber(contextMatch[1]);
  }

  const standaloneMatch = normalized.match(
    /(?:^|[\s,])(\d{3,6})(?:$|[\s,!?.])/,
  );
  if (!budget && standaloneMatch) {
    if (
      /build|pc|computer|rig|gaming|stream|work|editing|render|upgrade|parts|budget|dollars?|usd|spend/i.test(
        normalized,
      )
    ) {
      budget = toNumber(standaloneMatch[1]);
    }
  }

  // --- 🛡️ ANTI-ABUSE DETECTION ---
  const abusePatterns = [
    /(kill|murder|weapon|gun|bomb|attack|hurt|harm|violence|shoot|stab|suicide|self[-\s]?harm)/,
    /(porn|xxx|nude|naked|sex|nsfw|adult content)/,
    /(hate|racist|sexist|slur|harass|bully|threat|abuse)/,
    /(free money|click here|winner|lottery|bitcoin scam|giveaway scam|wire transfer)/,
    /(recipe|cooking|weather|horoscope|dating|relationship advice|sports scores|stocks|astrology)/,
    /\b(fuck|shit|ass|bitch|damn|cunt)\b/,
  ];

  const isAbusive = abusePatterns.some((pattern) => pattern.test(lower));

  const pcRelatedTerms =
    /(pc|computer|build|cpu|gpu|ram|ssd|motherboard|psu|cooler|gaming|fps|overclock|upgrade|part|component|hardware|software|nvidia|amd|intel|rtx|radeon|ryzen|ddr|nvme|case|fan|monitor|keyboard|mouse|peripheral|performance|budget|price|cheap|expensive|streaming|editing|rendering|workstation|bottleneck|fix|compatibility|storage|laptop|desktop|console|wifi|ethernet|vr|ray tracing)/;
  const isOffTopic =
    !pcRelatedTerms.test(lower) &&
    !/(hi|hello|hey|help|thanks|thank you|yes|no|okay|ok|pls|please|sure|cool)/.test(
      lower,
    );

  return {
    isGreeting:
      /\b(hello|hi|hey|yo|hiya|sup|greetings|good (morning|afternoon|evening))\b/.test(
        lower,
      ),
    isGaming:
      /\b(game|gaming|gamer|fps|esport|esports|valorant|cs2|counter[- ]?strike|fortnite|cod|warzone|apex|overwatch|league|dota|minecraft|vr|ray tracing|4k)\b/.test(
        lower,
      ),
    isWork:
      /\b(work|productiv|office|excel|word|powerpoint|coding|program|developer|dev|software|compile|render|editing|edit|video|photo|premiere|after effects|davinci|blender|cad|3d|autocad|solidworks|maya|machine learning|ai|data|analysis|workstation)\b/.test(
        lower,
      ),
    isStreaming:
      /\b(stream|streaming|twitch|obs|youtube live|kick|broadcast|go live)\b/.test(
        lower,
      ),
    wantsOC: /\b(overclock|overclocking|oc|xmp|pbo|undervolt)\b/.test(lower),
    budget: budget,
    needsExplanation:
      /\b(why|explain|reason|how|what'?s the difference|compare|pros and cons|help me understand)\b/.test(
        lower,
      ),
    askedUpgrade:
      /\b(upgrade|improve|better|replace|swap|future[- ]?proof|bottleneck|slow|lag|stutter|refresh)\b/.test(
        lower,
      ),
    isAbusive: isAbusive,
    isOffTopic: isOffTopic && !isAbusive,
  };
};

/**
 * Generates a build table with full compatibility notes
 * BUDGET-CONSTRAINED: Will adjust parts to stay within budget
 */
const generateBuildTable = (type, budget, wantsOC = false) => {
  const parts = KNOWLEDGE_BASE;
  let tier = "budget";
  if (budget >= 2500) tier = "enthusiast";
  else if (budget >= 1500) tier = "high";
  else if (budget >= 1000) tier = "mid";

  const cpuTier = tier === "enthusiast" ? "flagship" : tier;
  const gpuTier = tier === "enthusiast" ? "flagship" : tier;
  const componentTier = tier === "enthusiast" ? "ultra" : tier;

  // Select core components based on tier/budget logic
  const cpu = parts.cpus[cpuTier] || parts.cpus.mid;
  const gpu = parts.gpus[gpuTier] || parts.gpus.mid;
  const mobo = parts.motherboards[componentTier] || parts.motherboards.mid;
  const ramType = "32GB DDR5-6000"; // Simplified for example, real logic would select based on budget
  const ramPrice = 110;
  const ssdSize = "1TB";
  const ssdPrice = 80;
  const psu = parts.psu[componentTier] || parts.psu.mid;
  const currentCase = parts.cases[componentTier] || parts.cases.mid;
  const casePrice = currentCase.price;

  const cooler = parts.coolers[componentTier] || parts.coolers.mid;

  // Calculate total and compatibility
  let total =
    cpu.price +
    gpu.price +
    ramPrice +
    ssdPrice +
    mobo.price +
    psu.price +
    casePrice +
    cooler.price;
  const totalTdp = (cpu.tdp || 65) + (gpu.tdp || 200) + 100; // +100W for system

  // Build compatibility notes
  const compatNotes = [];
  compatNotes.push(
    `✅ **Socket Match:** ${cpu.socket} CPU + ${cpu.socket} Motherboard`,
  );
  compatNotes.push(
    `✅ **Power:** ${psu.wattage}W PSU handles ${totalTdp - 150}W load (+150W headroom)`,
  );
  compatNotes.push(
    `✅ **Cooling:** ${cooler.name} rated for ${cooler.tdp}W (CPU is ${cpu.tdp}W)`,
  );

  if (cpu.unlocked && mobo.oc) {
    compatNotes.push(
      `🔓 **OC Ready:** Unlocked CPU + Z/X-series board = Full overclocking support`,
    );
  } else if (cpu.unlocked && !mobo.oc) {
    compatNotes.push(
      `⚠️ **Limited OC:** Unlocked CPU but B-series board limits overclocking`,
    );
  }

  // Get a random relevant pro tip
  const relevantTips = PRO_TIPS.filter(
    (t) =>
      t.category === "Building" ||
      t.category === "Performance" ||
      (type === "gaming" && t.category === "Value"),
  );
  const randomTip =
    relevantTips[Math.floor(Math.random() * relevantTips.length)];
  const proTipText = randomTip
    ? `\n\n**Optional note:** ${randomTip.tip}\n*${randomTip.why}*`
    : "";

  const ramSpecs = parseRamSpecs(ramType);
  const buildRecommendations = [
    {
      category: "cpu",
      name: cpu.name,
      price: cpu.price,
      score: resolveBenchmarkScore(cpu),
      rationale: generateComponentRationale({
        category: "cpu",
        name: cpu.name,
        specs: { cores: cpu.cores },
        context: { type, tier, budget },
      }),
    },
    {
      category: "gpu",
      name: gpu.name,
      price: gpu.price,
      score: resolveBenchmarkScore(gpu),
      rationale: generateComponentRationale({
        category: "gpu",
        name: gpu.name,
        specs: { vram: gpu.vram },
        context: { type, tier, budget },
      }),
    },
    {
      category: "motherboard",
      name: mobo.name,
      price: mobo.price,
      rationale: generateComponentRationale({
        category: "motherboard",
        name: mobo.name,
        specs: { socket: cpu.socket, oc: mobo.oc },
        context: { type, tier, budget },
      }),
    },
    {
      category: "ram",
      name: ramType,
      price: ramPrice,
      rationale: generateComponentRationale({
        category: "ram",
        name: ramType,
        specs: ramSpecs,
        context: { type, tier, budget },
      }),
    },
    {
      category: "storage",
      name: `${ssdSize} NVMe SSD`,
      price: ssdPrice,
      rationale: generateComponentRationale({
        category: "storage",
        name: `${ssdSize} NVMe SSD`,
        specs: { size: ssdSize },
        context: { type, tier, budget },
      }),
    },
    {
      category: "cooler",
      name: cooler.name,
      price: cooler.price,
      rationale: generateComponentRationale({
        category: "cooler",
        name: cooler.name,
        specs: { tdp: cooler.tdp },
        context: { type, tier, budget },
      }),
    },
    {
      category: "psu",
      name: psu.name,
      price: psu.price,
      rationale: generateComponentRationale({
        category: "psu",
        name: psu.name,
        specs: {
          wattage: psu.wattage,
          headroom: Math.max(psu.wattage - (totalTdp - 150), 0),
        },
        context: { type, tier, budget },
      }),
    },
    {
      category: "case",
      name: currentCase.name,
      price: casePrice,
      rationale: generateComponentRationale({
        category: "case",
        name: currentCase.name,
        context: { type, tier, budget },
      }),
    },
  ];

  return {
    table: `| Component | Recommendation | Price | Action |
|-----------|---------------|-------|--------|
| **CPU** | ${partLink(cpu.name, "cpu")} (${cpu.cores} cores) | $${cpu.price} | ${addPartLink(cpu.name, "cpu", cpu.id)} |
| **GPU** | ${partLink(gpu.name, "gpu")} (${gpu.vram}) | $${gpu.price} | ${addPartLink(gpu.name, "gpu", gpu.id)} |
| **Motherboard** | ${partLink(mobo.name, "motherboard")} | $${mobo.price} | ${addPartLink(mobo.name, "motherboard", mobo.id)} |
| **RAM** | ${ramType} | $${ramPrice} | ${addPartLink(ramType, "ram")} |
| **Storage** | ${ssdSize} NVMe SSD | $${ssdPrice} | ${addPartLink(ssdSize + " NVMe SSD", "storage")} |
| **Cooler** | ${partLink(cooler.name, "cooler")} | $${cooler.price === 0 ? "Included" : "$" + cooler.price} | ${addPartLink(cooler.name, "cooler", cooler.id)} |
| **Power** | ${partLink(psu.name, "psu")} | $${psu.price} | ${addPartLink(psu.name, "psu", psu.id)} |
| **Case** | ${partLink(currentCase.name, "case")} | $${casePrice} | ${addPartLink(currentCase.name, "case")} |`,
    total: total,
    budget: budget,
    compatNotes: compatNotes.join("\n"),
    proTip: proTipText,
    reasoning:
      type === "work"
        ? `**Fit:** The ${partLink(cpu.name)} handles multi-tasking, the ${partLink(gpu.name)} covers rendering, and ${cooler.name} keeps thermals controlled.`
        : `**Fit:** The ${partLink(gpu.name)} delivers ${gpu.tier} gaming performance, while the ${partLink(cpu.name)} keeps the system balanced.`,
    recommendations: buildRecommendations,
    // Smart upsell suggestions
    upsells: generateUpsells(
      {
        cpu,
        gpu,
        cooler,
        case: currentCase,
        psu,
      },
      tier,
      type,
      budget,
      total,
    ),
  };
};

/**
 * Generate smart upsell recommendations
 * Shows what the user could get for a bit more money
 */
const generateUpsells = (currentParts, tier, type, budget, currentTotal) => {
  const suggestions = [];
  const buildSuggestion = (component, currentPart, upgrade, maxDiff = 300) => {
    if (!currentPart || !upgrade || !upgrade.name) return;

    const currentPrice = currentPart.price || 0;
    const upgradePrice = upgrade.price || 0;
    const priceDiff = upgradePrice - currentPrice;
    if (priceDiff <= 0 || priceDiff > maxDiff) return;

    const newTotal = currentTotal + priceDiff;

    suggestions.push({
      component,
      current: currentPart.name,
      currentPrice,
      upgrade: upgrade.name,
      upgradePrice,
      priceDiff,
      newTotal,
      benefit: upgrade.advantage,
      stretch: newTotal > budget ? newTotal - budget : 0,
    });
  };

  buildSuggestion(
    "CPU",
    currentParts.cpu,
    getBetterComponent(
      "cpu",
      currentParts.cpu,
      currentParts.cpu ? currentParts.cpu.price + 300 : null,
    ),
    300,
  );
  buildSuggestion(
    "GPU",
    currentParts.gpu,
    getBetterComponent(
      "gpu",
      currentParts.gpu,
      currentParts.gpu ? currentParts.gpu.price + 300 : null,
    ),
    300,
  );
  buildSuggestion(
    "COOLER",
    currentParts.cooler,
    getBetterComponent(
      "cooler",
      currentParts.cooler,
      currentParts.cooler ? currentParts.cooler.price + 200 : null,
    ),
    200,
  );
  buildSuggestion(
    "PSU",
    currentParts.psu,
    getBetterComponent(
      "psu",
      currentParts.psu,
      currentParts.psu ? currentParts.psu.price + 150 : null,
    ),
    150,
  );
  buildSuggestion(
    "CASE",
    currentParts.case,
    getBetterComponent(
      "case",
      currentParts.case,
      currentParts.case ? currentParts.case.price + 200 : null,
    ),
    200,
  );

  const componentPriority = { CPU: 1, GPU: 2, COOLER: 3, PSU: 4, CASE: 5 };
  suggestions.sort(
    (a, b) =>
      a.priceDiff - b.priceDiff ||
      componentPriority[a.component] - componentPriority[b.component],
  );

  return suggestions;
};

/**
 * Format upsell suggestions for display
 */
const formatUpsells = (upsells) => {
  if (!upsells || upsells.length === 0) return "";

  let text = "\n### Upgrade Paths\n";

  for (const up of upsells) {
    if (up.stretch > 0) {
      text += `\n- **${up.component}:** +$${up.priceDiff} to ${partLink(up.upgrade)} (${up.benefit}) — **$${up.stretch} over budget**\n`;
    } else {
      text += `\n- **${up.component}:** +$${up.priceDiff} to ${partLink(up.upgrade)} (${up.benefit}) — within budget\n`;
    }
  }

  return text;
};

/**
 * Search guides for relevant content
 */
const searchGuides = (query) => {
  const lower = query.toLowerCase();
  let bestMatch = null;
  let highestScore = 0;

  // Helper to check match score
  const checkMatch = (item, type) => {
    let score = 0;
    // Check triggers
    if (item.triggers) {
      item.triggers.forEach((trigger) => {
        if (lower.includes(trigger)) score += 10;
      });
    }
    // Check title
    if (lower.includes(item.title.toLowerCase())) score += 5;

    if (score > highestScore && score >= 5) {
      highestScore = score;
      bestMatch = { ...item, type };
    }
  };

  // Search all guide categories
  if (GUIDE_KNOWLEDGE.troubleshooting)
    GUIDE_KNOWLEDGE.troubleshooting.forEach((item) =>
      checkMatch(item, "troubleshoot"),
    );
  if (GUIDE_KNOWLEDGE.assembly)
    GUIDE_KNOWLEDGE.assembly.forEach((item) => checkMatch(item, "assembly"));
  if (GUIDE_KNOWLEDGE.concepts)
    GUIDE_KNOWLEDGE.concepts.forEach((item) => checkMatch(item, "concept"));
  if (GUIDE_KNOWLEDGE.beginner)
    GUIDE_KNOWLEDGE.beginner.forEach((item) => checkMatch(item, "beginner"));
  if (GUIDE_KNOWLEDGE.gaming)
    GUIDE_KNOWLEDGE.gaming.forEach((item) => checkMatch(item, "gaming"));

  return bestMatch;
};

/**
 * MAIN GENERATOR FUNCTION
 */
export const generateSmartResponse = (message, context = {}) => {
  const { normalized } = normalizeUserMessage(message, { logMatches: false });
  const intents = parseIntent(normalized);
  const lower = normalized.toLowerCase();

  // 📊 Store message for originating context
  _lastUserMessage = message;
  const extractedEntities = extractEntities(message, normalized);
  _lastExtractedEntities = extractedEntities;
  storeExtractedEntities(extractedEntities);

  // 🆘 HELP REQUEST HANDLER (e.g. from Contact Page)
  if (
    lower.includes("i need help with something") ||
    lower.includes("help me with something")
  ) {
    return trackedResponse("help-request", {
      text: "I'm here to help! 👋\n\nWhat kind of assistance do you need today?\n\n• **PC Building**: Advice on parts or compatibility?\n• **App Issues**: Something not working right?\n• **Report**: Need to report a bug or user?\n\nJust let me know and I'll guide you to the right place!",
      suggestions: ["Build Help", "App Issue", "Report User", "Just Chatting"],
    });
  }

  // 📦 ORDER STATUS HANDLER
  if (
    /order|shipping|delivery|track.*package|where.*stuff/i.test(lower) &&
    !lower.includes("order to") &&
    !lower.includes("priority")
  ) {
    return trackedResponse("order-status", {
      text: "Since NexusBuild compares prices across multiple stores (Amazon, Newegg, Best Buy), we don't handle shipping directly.\n\n**To check your order:**\n1. Check your email for a confirmation from the retailer (e.g., Amazon)\n2. Log in to that retailer's website\n\nWe help you find the best parts, but the actual purchase happens securely on their site! 🛍️",
      suggestions: ["Back to Building", "Report Missing Item", "Help Center"],
    });
  }

  // 🧠 Get current memory state (message already processed by UI context)
  const mem = getMemory();

  // 🔄 CONVERSATION FLOW: Check if user is answering a previous question
  const answeringType = isAnsweringQuestion(message);
  const detectedComponent = detectsComponent(message);

  // If user is answering our question (like "Quadro M4000" after we asked for GPU)
  if (answeringType && detectedComponent) {
    // Do nothing specific here, context already updated by middleware
    // But we can acknowledge it
  }

  // --- POLICY CHECKS ---
  if (intents.isAbusive) {
    return trackedResponse("anti-abuse", {
      text: "⚠️ **Content Policy Violation**\n\nI'm designed exclusively for PC building assistance. I can't help with that request.\n\nPlease use our **Report Issue** feature if you need to contact support.\n\nLet's get back to building! What kind of PC are you looking for?",
      suggestions: ["Gaming PC build", "Workstation setup", "Report an issue"],
    });
  }

  // 📊 ANALYTICS COMMAND - View AI performance stats
  if (/^\/analytics|^show analytics|^nexus stats|^ai stats/i.test(lower)) {
    const report = getAnalyticsReport();
    return trackedResponse("analytics-command", {
      text: report,
      suggestions: ["Reset analytics", "Build me a PC", "Best GPU?"],
    });
  }

  // 🔄 OFF-TOPIC: Redirect to PC topics (but NOT if they mention a component!)
  const isShortComponentMessage =
    detectedComponent && message.split(" ").length <= 8;

  if (
    intents.isOffTopic &&
    !isShortComponentMessage &&
    !mem.wantsUpgrade &&
    !answeringType
  ) {
    return {
      text: "I specialize in **PC building only**. I can help with:\n\n🎮 Gaming builds & performance\n💻 Component compatibility\n💰 Budget optimization\n🔧 Upgrade recommendations\n\nWhat PC project can I help you with?",
      suggestions: [
        "Gaming PC for $1500",
        "Check compatibility",
        "Best GPU for 4K",
      ],
    };
  }

  // dY"~ GUIDE SEARCH - Check if user is asking how to do something
  const isBuildRequest = Boolean(
    intents.budget &&
    /(build|pc|computer|rig|setup|tower|workstation)/i.test(lower),
  );
  const isGuideQuery =
    intents.needsExplanation ||
    /\bguide\b|how to|tips|what is|explain|steps|install/i.test(lower);
  const guideMatch =
    !isBuildRequest && isGuideQuery ? searchGuides(normalized) : null;
  if (guideMatch) {
    return trackedResponse("guide-lookup", {
      text: `Here is the guide for ** ${guideMatch.title} **:

${guideMatch.content}

Need more details ? You can also check the interactive ** Build Guide ** in the app menu! dY"s`,
      suggestions: ["Show full guide", "Next step", "Troubleshooting"],
    });
  } else if (!isBuildRequest && lower.includes("guide")) {
    return trackedResponse("guide-general", {
      text: `I can help with several guides:

- Beginner's Guide
- Gaming PC Guide
- Workstation Guide
- Assembly Steps
- Troubleshooting

Which one are you interested in?`,
      suggestions: ["Gaming Guide", "Assembly Steps", "Troubleshooting"],
    });
  }

  // 🏗️ BUILD CONTEXT HELPER - Extract all parts from current build
  const getBuildSummary = () => {
    const parts = context.currentBuild?.parts;
    if (!parts) return null;

    const partsList = [];
    const partNames = {
      cpu: "CPU",
      gpu: "GPU",
      motherboard: "Motherboard",
      ram: "RAM",
      storage: "Storage",
      psu: "PSU",
      case: "Case",
      cooler: "Cooler",
      fan: "Fans",
      monitor: "Monitor",
      keyboard: "Keyboard",
      mouse: "Mouse",
    };

    for (const [key, part] of Object.entries(parts)) {
      if (part && (part.name || part.title)) {
        partsList.push({
          category: partNames[key] || key,
          name: part.name || part.title,
          price: part.price,
          key: key,
        });
      }
    }
    return partsList.length ? partsList : null;
  };

  // 13. SPECIFIC PART LOOKUP (New!)
  // Detect questions like "what is X", "tell me about X", "specs for X"
  const partLookupPatterns = [
    /(?:what(?:'s| is)(?: a| an| the)?|tell me about|info on|specs for|information about|details on|explain)\s+(.+)/i,
    /^(rtx|gtx|rx|radeon|geforce|quadro|ryzen|intel|i[3579]|threadripper|epyc)\s*.+/i,
  ];

  for (const pattern of partLookupPatterns) {
    const match = lower.match(pattern);
    if (match) {
      const query = match[1] || match[0];
      const normalizedQuery = normalizeUserInput(query);

      // Check terminology first
      const termKey = normalizedQuery.trim().toLowerCase();
      if (TERMINOLOGY[termKey]) {
        const term = TERMINOLOGY[termKey];
        return {
          text: `## ${term.term} \n\n${term.definition} \n\n ** Example:** ${term.example} `,
          suggestions: term.relatedTerms
            ? term.relatedTerms.slice(0, 3).map((t) => `What is ${t}?`)
            : ["Build a PC", "Compare parts"],
        };
      }

      const partInfo = searchParts(normalizedQuery.trim());

      if (partInfo) {
        // Single match - show detailed info
        if (!Array.isArray(partInfo)) {
          const formatted = formatPartInfo(partInfo);
          return {
            text: formatted,
            suggestions: partInfo.competitors
              ? [
                  `Compare to ${partInfo.competitors[0]} `,
                  "Build with this part",
                  "Similar alternatives",
                ]
              : ["Build a PC", "Compare parts", "Budget recommendations"],
          };
        }
        // Multiple matches - list them
        if (partInfo.length > 0 && partInfo.length <= 5) {
          let text = `## Found ${partInfo.length} parts matching "${query}"\n\n`;
          partInfo.forEach((p) => {
            text += `### ${p.name} \n`;
            if (p.type) text += `- Type: ${p.type} \n`;
            if (p.msrp) text += `- MSRP: $${p.msrp} \n`;
            if (p.performance) text += `- ${p.performance} \n`;
            text += "\n";
          });
          text += "Want details on a specific one?";
          return {
            text,
            suggestions: partInfo.map((p) => `Details on ${p.name} `),
          };
        }
      }
    }
  }

  /**
   * Search guides for relevant content
   */

  /**
   * MAIN GENERATOR FUNCTION
   */
  // This function was moved and modified above. The original placeholder is removed.

  // 🔍 GET BUILD ISSUES - Check all parts for compatibility problems
  const getBuildIssues = () => {
    const parts = context.currentBuild?.parts;
    if (!parts) return { errors: [], warnings: [] };

    const errors = [];
    const warnings = [];

    // Check each part against the build
    for (const [category, part] of Object.entries(parts)) {
      if (!part) continue;

      // Add category to part for compatibility check
      const partWithCategory = { ...part, category };
      const result = checkCompatibility(partWithCategory, context.currentBuild);

      if (result && result.compatible === false) {
        errors.push({
          category,
          partName: part.name || part.title,
          reason: result.reason,
        });
      }

      if (result && result.warning) {
        warnings.push({
          category,
          partName: part.name || part.title,
          warning: result.warning,
        });
      }
    }

    return { errors, warnings };
  };

  // 🔍 MY BUILD QUESTIONS - When user asks about their current build
  // IMPORTANT: Exclude bottleneck questions - those should go to the bottleneck handler
  const isBottleneckRelated = /(bottleneck|bottle-neck|bottle neck)/i.test(
    lower,
  );
  const askingAboutBuild =
    /(my build|my current|what do i have|what's in my|whats in my|show my build|my parts|my setup|my rig|my pc)/i.test(
      lower,
    ) && !isBottleneckRelated;

  // 🔧 COMPATIBILITY CHECK - Detailed build analysis
  const askingCompatibility =
    /(check compatibility|compatible|compatibility issues|any issues|any problems with my build)/i.test(
      lower,
    );

  if (askingCompatibility) {
    const buildParts = getBuildSummary();

    if (!buildParts || buildParts.length === 0) {
      return trackedResponse("compatibility-empty", {
        text: "## 🔍 No Parts to Check\n\nYou haven't added any parts to your build yet. Head to the **Builder** and add some components, then I can check for compatibility issues!",
        suggestions: ["Start a build", "Best gaming CPU?", "$1000 gaming PC"],
      });
    }

    const { errors, warnings } = getBuildIssues();

    if (errors.length === 0 && warnings.length === 0) {
      return trackedResponse("compatibility-ok", {
        text: `## Compatibility Check\n\nNo compatibility issues detected.\n\n**Checked:**\n- Socket compatibility\n- RAM type compatibility\n- Power requirements\n- Case clearance\n- Cooling capacity\n\n**Optional note:** Keep cable management and airflow in mind.`,
        suggestions: [
          "Any bottlenecks?",
          "Upgrade suggestions",
          "Check my PSU",
        ],
      });
    }

    // Build the response with issues
    let responseText = `## 🔍 Compatibility Analysis\n\n`;

    if (errors.length > 0) {
      responseText += `### ❌ Critical Issues(${errors.length}) \n\n`;
      errors.forEach((err) => {
        responseText += `** ${err.category.toUpperCase()}:** ${err.partName} \n`;
        responseText += `> ${err.reason} \n\n`;
      });
    }

    if (warnings.length > 0) {
      responseText += `### ⚠️ Warnings(${warnings.length}) \n\n`;
      warnings.forEach((warn) => {
        responseText += `** ${warn.category.toUpperCase()}:** ${warn.partName} \n`;
        responseText += `> ${warn.warning} \n\n`;
      });
    }

    responseText += `-- -\n\n💡 ** Need help fixing these ?** I can suggest replacement parts!\n`;

    return trackedResponse("compatibility-issues", {
      text: responseText,
      suggestions:
        errors.length > 0
          ? ["Fix socket issue", "Suggest alternatives", "Ignore warning"]
          : ["Fix warnings", "Upgrade suggestions", "Best alternatives"],
    });
  }

  if (askingAboutBuild) {
    const buildParts = getBuildSummary();

    if (buildParts && buildParts.length > 0) {
      let totalPrice = 0;
      let partsTable =
        "| Component | Part | Price |\n|-----------|------|-------|\n";

      buildParts.forEach((p) => {
        partsTable += `| ** ${p.category}** | ${p.name} | ${p.price ? "$" + p.price : "-"} |\n`;
        totalPrice += p.price || 0;
      });

      // Also include compatibility status in build view
      const { errors, warnings } = getBuildIssues();
      let compatStatus = "";
      if (errors.length > 0) {
        compatStatus = `\n\n⚠️ ** ${errors.length} compatibility issue(s) detected! ** Ask me to "check compatibility" for details.`;
      } else if (warnings.length > 0) {
        compatStatus = `\n\n💡 ** ${warnings.length} warning(s) ** - nothing critical, but worth checking.`;
      } else {
        compatStatus = `\n\n✅ ** No compatibility issues detected! ** `;
      }

      return trackedResponse("my-build-view", {
        text: `## 🖥️ Your Current Build\n\nHere's what you have so far:\n\n${partsTable}\n**Estimated Total: $${totalPrice.toFixed(2)}**${compatStatus}\n\nNeed help with anything? I can:\n- Check for **compatibility issues**\n- Suggest **upgrades**\n- Analyze for **bottlenecks**\n- Recommend **missing parts**`,
        suggestions: [
          "Check compatibility",
          "Any bottlenecks?",
          "What am I missing?",
        ],
      });
    } else {
      return trackedResponse("my-build-empty", {
        text: "## 🖥️ Your Build is Empty\n\nYou haven't added any parts yet! Head to the **Builder** and start picking components.\n\nOnce you add parts, I can:\n- Check **compatibility**\n- Spot **bottlenecks**\n- Suggest **upgrades**\n- Help you **optimize** for your budget",
        suggestions: [
          "$1000 gaming build",
          "Best CPU for gaming?",
          "Help me start",
        ],
      });
    }
  }

  // 🔧 INTELLIGENT PART ANALYSIS - "Is my X enough?" questions
  // These actually analyze whether the component is sufficient, not just state what they have

  // CPU Analysis - "Is my CPU enough?"
  const cpuEnoughPattern =
    /(is my cpu|is my processor|cpu enough|processor enough|enough cpu|do i need a better cpu|is my cpu good)/i;
  if (cpuEnoughPattern.test(lower)) {
    const cpu = context.currentBuild?.parts?.cpu;
    const gpu = context.currentBuild?.parts?.gpu;
    const cpuName = cpu?.name || cpu?.title;

    if (cpuName) {
      const cpuScore = cpu?.score || 0;
      const gpuScore = gpu?.score || 0;
      const gpuName = gpu?.name || gpu?.title || "your GPU";

      let analysis = "";
      let verdict = "";

      // Check if CPU is bottlenecking GPU
      if (gpuScore > 0 && cpuScore > 0) {
        const ratio = cpuScore / gpuScore;
        if (ratio < 0.5) {
          verdict = "⚠️ **CPU may bottleneck your GPU**";
          analysis = `Your **${cpuName}** is paired with **${gpuName}**.\n\nThe CPU might limit your GPU's performance, especially at 1080p.\n\n**Recommendation:** Consider upgrading to a higher-tier CPU for balanced performance.`;
        } else if (ratio < 0.7) {
          verdict = "✅ **Good, but could be better**";
          analysis = `Your **${cpuName}** works well with **${gpuName}** at 1440p/4K.\n\nAt 1080p, you might see some CPU limitation in competitive games.\n\n**Verdict:** Upgrade only if you play at 1080p high refresh rate.`;
        } else {
          verdict = "✅ **Yes, great pairing!**";
          analysis = `Your **${cpuName}** is well-matched with **${gpuName}**!\n\nNo bottleneck expected. You're all set for gaming!`;
        }
      } else {
        // No GPU or no score data - give general assessment
        if (/i9|ryzen 9|7950|14900|13900/i.test(cpuName)) {
          verdict = "✅ **Top-tier CPU!**";
          analysis = `The **${cpuName}** is an enthusiast-grade processor.\n\nExcellent for:\n- High refresh rate gaming\n- Streaming while gaming\n- Content creation\n- Heavy multitasking`;
        } else if (/i7|ryzen 7|7800|7700|14700|13700/i.test(cpuName)) {
          verdict = "✅ **Great for gaming!**";
          analysis = `The **${cpuName}** is a high-end processor.\n\nPerfect for:\n- High-FPS gaming\n- Streaming\n- Content creation\n\nNo upgrade needed for most users.`;
        } else if (/i5|ryzen 5|7600|13600|14600|13400/i.test(cpuName)) {
          verdict = "✅ **Solid choice!**";
          analysis = `The **${cpuName}** is excellent for gaming.\n\nGreat for:\n- 1440p/4K gaming ✅\n- General productivity ✅\n\nConsider upgrading to i7/Ryzen 7 only if you stream or do heavy editing.`;
        } else if (/i3|ryzen 3/i.test(cpuName)) {
          verdict = "⚠️ **Entry-level CPU**";
          analysis = `The **${cpuName}** is a budget processor.\n\nOkay for:\n- 1080p gaming at moderate settings\n- Basic productivity\n\n**Recommendation:** Upgrade to i5/Ryzen 5 for better gaming performance.`;
        } else {
          verdict = "💻 **CPU Assessment**";
          analysis = `You have the **${cpuName}**.\n\nGeneral CPU tiers:\n- **i3/Ryzen 3** = Budget gaming\n- **i5/Ryzen 5** = Great for gaming\n- **i7/Ryzen 7** = High-end gaming + streaming\n- **i9/Ryzen 9** = Enthusiast/workstation`;
        }
      }

      return {
        text: `## 🖥️ CPU Analysis: ${cpuName}\n\n${verdict}\n\n${analysis}`,
        suggestions: ["Check for bottleneck", "Show my build", "Upgrade CPU?"],
      };
    } else {
      return {
        text: `## 🖥️ CPU Analysis\n\nYou haven't selected a CPU yet! Here's what you need:\n\n| Use Case | Recommended CPUs |\n|----------|------------------|\n| **Budget Gaming** | i5-13400, Ryzen 5 7600 |\n| **High-End Gaming** | i5-14600K, Ryzen 7 7800X3D |\n| **Gaming + Streaming** | i7-14700K, Ryzen 7 7800X3D |\n| **Workstation** | i9-14900K, Ryzen 9 7950X |`,
        suggestions: [
          "Best CPU for gaming",
          "Budget CPU options",
          "Show my build",
        ],
      };
    }
  }

  // GPU Analysis - "Is my GPU enough?"
  const gpuEnoughPattern =
    /(is my gpu|is my graphics|gpu enough|graphics enough|enough gpu|do i need a better gpu|is my gpu good|is my video card)/i;
  if (gpuEnoughPattern.test(lower)) {
    const gpu = context.currentBuild?.parts?.gpu;
    const gpuName = gpu?.name || gpu?.title;

    if (gpuName) {
      let analysis = "";
      let verdict = "";

      // Tier detection based on GPU name
      if (/4090|7900\s*xtx/i.test(gpuName)) {
        verdict = "🔥 **Flagship GPU!**";
        analysis = `The **${gpuName}** is the best of the best!\n\n- 4K 60+ FPS in ALL games ✅\n- 4K 120+ in many titles ✅\n- Ray tracing at max settings ✅\n\nNo upgrade exists. You have the top!`;
      } else if (/4080|7900\s*xt(?!x)/i.test(gpuName)) {
        verdict = "✅ **High-end GPU!**";
        analysis = `The **${gpuName}** is excellent!\n\n- 4K 60+ FPS in most games ✅\n- 1440p 100+ FPS easily ✅\n- Great ray tracing ✅\n\nNo upgrade needed unless you want the absolute best.`;
      } else if (/4070|7800/i.test(gpuName)) {
        verdict = "✅ **Great for 1440p!**";
        analysis = `The **${gpuName}** is the sweet spot!\n\n- 1440p 100+ FPS ✅\n- 4K 60 FPS (some titles) ✅\n- Good ray tracing ✅\n\nPerfect for most gamers.`;
      } else if (/4060|7600/i.test(gpuName)) {
        verdict = "✅ **Good for 1080p!**";
        analysis = `The **${gpuName}** handles 1080p well.\n\n- 1080p 100+ FPS ✅\n- 1440p 60+ FPS ✅\n\n⚠️ Consider upgrading if you want:\n- 1440p high refresh\n- 4K gaming\n- Heavy ray tracing`;
      } else if (/3060|6650|6700/i.test(gpuName)) {
        verdict = "⚠️ **Last-gen, still capable**";
        analysis = `The **${gpuName}** is showing its age.\n\n- 1080p gaming is fine ✅\n- 1440p may struggle in new AAA games\n\n**Recommendation:** Consider upgrading to RTX 4060/4070 or RX 7600/7800 for modern titles.`;
      } else {
        verdict = "🎮 **GPU Assessment**";
        analysis = `You have the **${gpuName}**.\n\nGeneral GPU tiers by resolution:\n- **RTX 4060 / RX 7600** = 1080p\n- **RTX 4070 / RX 7800** = 1440p\n- **RTX 4080 / RX 7900** = 4K\n- **RTX 4090** = Ultimate`;
      }

      return {
        text: `## 🎮 GPU Analysis: ${gpuName}\n\n${verdict}\n\n${analysis}`,
        suggestions: ["Check for bottleneck", "Show my build", "Upgrade GPU?"],
      };
    } else {
      return {
        text: `## 🎮 GPU Analysis\n\nYou haven't selected a GPU yet! Here's what you need:\n\n| Resolution | Recommended GPUs |\n|------------|------------------|\n| **1080p** | RTX 4060, RX 7600 |\n| **1440p** | RTX 4070, RX 7800 XT |\n| **4K** | RTX 4080, RX 7900 XTX |\n| **4K Ultra** | RTX 4090 |`,
        suggestions: [
          "Best GPU for gaming",
          "Budget GPU options",
          "Show my build",
        ],
      };
    }
  }

  // RAM Analysis - "Is my RAM enough?"
  const ramEnoughPattern =
    /(is my ram|is my memory|ram enough|memory enough|enough ram|enough memory|do i need more ram)/i;
  if (ramEnoughPattern.test(lower)) {
    const ram = context.currentBuild?.parts?.ram;
    const ramName = ram?.name || ram?.title;

    if (ramName) {
      // Try to extract RAM size from name (e.g., "32GB", "16GB")
      const sizeMatch = ramName.match(/(\d+)\s*GB/i);
      const ramSize = sizeMatch ? parseInt(sizeMatch[1]) : null;

      let analysis = "";
      let verdict = "";

      if (ramSize) {
        if (ramSize >= 32) {
          verdict = "✅ **Yes, that's plenty!**";
          analysis = `**${ramSize}GB** is excellent for:\n- Gaming at max settings\n- Streaming while gaming\n- Video editing & 3D rendering\n- Heavy multitasking\n\nYou're set! No upgrade needed.`;
        } else if (ramSize >= 16) {
          verdict = "✅ **Yes, for most uses!**";
          analysis = `**${ramSize}GB** is good for:\n- Modern gaming ✅\n- General productivity ✅\n- Light video editing ✅\n\n⚠️ Consider 32GB if you:\n- Stream while gaming\n- Do heavy video editing\n- Run many Chrome tabs + games`;
        } else if (ramSize >= 8) {
          verdict = "⚠️ **Minimum for gaming**";
          analysis = `**${ramSize}GB** is the bare minimum today.\n\n❌ You may experience:\n- Stuttering in newer games\n- Slowdowns when multitasking\n- Browser tabs closing\n\n**Recommendation:** Upgrade to 16GB or 32GB for a much better experience.`;
        } else {
          verdict = "❌ **Not enough**";
          analysis = `**${ramSize}GB** is outdated for modern PCs.\n\n**Upgrade immediately** to at least 16GB for basic gaming, or 32GB for a future-proof build.`;
        }
      } else {
        analysis = `You have **${ramName}** in your build. Generally:\n- **8GB** = Bare minimum\n- **16GB** = Good for gaming\n- **32GB** = Great for gaming + streaming/editing`;
      }

      return {
        text: `## 🧠 RAM Analysis: ${ramName}\n\n${verdict}\n\n${analysis}`,
        suggestions: [
          "Upgrade RAM?",
          "Check my full build",
          "Any bottlenecks?",
        ],
      };
    } else {
      return {
        text: `## 🧠 RAM Analysis\n\nYou haven't selected RAM yet! Here's what you need:\n\n| Use Case | Minimum | Recommended |\n|----------|---------|-------------|\n| **Gaming** | 16GB | 32GB |\n| **Work/Office** | 8GB | 16GB |\n| **Streaming + Gaming** | 32GB | 32GB |\n| **Video Editing** | 32GB | 64GB |`,
        suggestions: [
          "Best RAM for gaming",
          "Budget RAM options",
          "Show my build",
        ],
      };
    }
  }

  // PSU Analysis - "Is my PSU enough?"
  const psuEnoughPattern =
    /(is my psu|is my power|psu enough|power enough|enough power|enough wattage|wattage enough)/i;
  if (psuEnoughPattern.test(lower)) {
    const psu = context.currentBuild?.parts?.psu;
    const gpu = context.currentBuild?.parts?.gpu;
    const cpu = context.currentBuild?.parts?.cpu;
    const psuName = psu?.name || psu?.title;

    if (psuName) {
      // Try to extract wattage (e.g., "750W", "850W")
      const wattMatch = psuName.match(/(\d+)\s*W/i);
      const wattage = wattMatch ? parseInt(wattMatch[1]) : null;

      let analysis = "";
      if (wattage) {
        const gpuName = gpu?.name || gpu?.title || "unknown GPU";
        const cpuName = cpu?.name || cpu?.title || "unknown CPU";

        // Estimate power needs based on common parts
        let estimatedNeed = 400; // Base
        if (/4090|7900\s*xtx/i.test(gpuName)) estimatedNeed = 850;
        else if (/4080|7900\s*xt/i.test(gpuName)) estimatedNeed = 750;
        else if (/4070|7800/i.test(gpuName)) estimatedNeed = 650;
        else if (/4060|7600/i.test(gpuName)) estimatedNeed = 550;

        if (wattage >= estimatedNeed + 100) {
          analysis = `✅ **Yes, ${wattage}W is plenty!**\n\nWith your ${gpuName}, you have good headroom. You're all set!`;
        } else if (wattage >= estimatedNeed) {
          analysis = `✅ **Yes, ${wattage}W should work.**\n\nYou're cutting it close with ${gpuName}, but it should be fine for normal use. Consider upgrading if you plan to overclock.`;
        } else {
          analysis = `⚠️ **${wattage}W might be tight!**\n\nWith ${gpuName}, you ideally want **${estimatedNeed}W or more**.\n\nRisk of:\n- System shutdowns under load\n- Component damage over time\n\n**Recommendation:** Upgrade to a ${estimatedNeed + 100}W PSU.`;
        }
      } else {
        analysis = `You have **${psuName}**.\n\nGeneral PSU guidelines:\n- RTX 4060/RX 7600 → 550W+\n- RTX 4070/RX 7800 → 650W+\n- RTX 4080/RX 7900 → 750W+\n- RTX 4090 → 850W+`;
      }

      return {
        text: `## ⚡ PSU Analysis: ${psuName}\n\n${analysis}`,
        suggestions: ["Upgrade PSU?", "Check compatibility", "Show my build"],
      };
    } else {
      return {
        text: `## ⚡ PSU Analysis\n\nYou haven't selected a PSU yet! Here's what you need based on GPU:\n\n| GPU | Minimum PSU |\n|-----|-------------|\n| RTX 4060 / RX 7600 | 550W |\n| RTX 4070 / RX 7800 | 650W |\n| RTX 4080 / RX 7900 XT | 750W |\n| RTX 4090 / RX 7900 XTX | 850W |`,
        suggestions: [
          "Best PSU for my build",
          "Budget PSU options",
          "Show my build",
        ],
      };
    }
  }

  // Storage Analysis - "Is my storage enough?"
  const storageEnoughPattern =
    /(is my storage|is my ssd|storage enough|enough storage|enough space|need more storage)/i;
  if (storageEnoughPattern.test(lower)) {
    const storage = context.currentBuild?.parts?.storage;
    const storageName = storage?.name || storage?.title;

    if (storageName) {
      const sizeMatch = storageName.match(/(\d+)\s*(TB|GB)/i);
      let sizeGB = 0;
      if (sizeMatch) {
        sizeGB = parseInt(sizeMatch[1]);
        if (sizeMatch[2].toUpperCase() === "TB") sizeGB *= 1000;
      }

      let analysis = "";
      if (sizeGB >= 2000) {
        analysis = `✅ **${sizeGB >= 1000 ? sizeGB / 1000 + "TB" : sizeGB + "GB"} is excellent!**\n\nPlenty of room for:\n- Multiple AAA games (100GB+ each)\n- Large media libraries\n- Creative projects`;
      } else if (sizeGB >= 1000) {
        analysis = `✅ **1TB is good for most users.**\n\nEnough for ~10 modern games + apps.\n\n💡 Consider adding a second drive later if you need more space.`;
      } else if (sizeGB >= 500) {
        analysis = `⚠️ **500GB fills up fast!**\n\nModern games are 50-150GB each. You'll fit maybe 4-5 games.\n\n**Recommendation:** Upgrade to 1TB or add a second drive.`;
      } else {
        analysis = `❌ **${sizeGB}GB is too small** for a modern gaming PC.\n\n**Upgrade to at least 1TB** for a good experience.`;
      }

      return {
        text: `## 💾 Storage Analysis: ${storageName}\n\n${analysis}`,
        suggestions: ["Add more storage?", "Best SSD options", "Show my build"],
      };
    } else {
      return {
        text: `## 💾 Storage Analysis\n\nYou haven't selected storage yet! Here's what you need:\n\n| Use Case | Recommended |\n|----------|-------------|\n| **Budget Gaming** | 500GB NVMe SSD |\n| **Standard Gaming** | 1TB NVMe SSD |\n| **Enthusiast** | 2TB NVMe SSD |\n| **Content Creator** | 2TB+ NVMe + 4TB HDD |`,
        suggestions: [
          "Best SSD for gaming",
          "Budget storage options",
          "Show my build",
        ],
      };
    }
  }

  // Motherboard Analysis - "Is my motherboard enough?"
  const moboEnoughPattern =
    /(is my motherboard|is my mobo|motherboard enough|mobo enough|good motherboard|good mobo)/i;
  if (moboEnoughPattern.test(lower)) {
    const mobo = context.currentBuild?.parts?.motherboard;
    const moboName = mobo?.name || mobo?.title;

    if (moboName) {
      let analysis = "";
      let verdict = "";

      // Chipset Detection
      const isHighEnd = /z790|z690|x670|x570/i.test(moboName);
      const isMidRange = /b760|b660|b650|b550/i.test(moboName);
      const isBudget = /h610|a620|a520|h510/i.test(moboName);
      const isITX = /itx|mini-itx/i.test(moboName);

      if (isHighEnd) {
        verdict = "🔥 **Top-tier Board!**";
        analysis = `The **${moboName}** is an enthusiast board.\n\n**Features:**\n- Full overclocking support ✅\n- Tons of PCIe lanes for storage ✅\n- Premium VRMs for high-end CPUs ✅\n\n**Perfect for:** i7/i9 or Ryzen 7/9 processors.`;
      } else if (isMidRange) {
        verdict = "✅ **The Sweet Spot**";
        analysis = `The **${moboName}** is the best value choice.\n\n**Features:**\n- Great performance for gaming ✅\n- Memory overclocking support ✅\n- Good connectivity ✅\n\n**Perfect for:** i5/Ryzen 5/Ryzen 7 gaming builds. You don't need to spend more unless you're heavily overclocking.`;
      } else if (isBudget) {
        verdict = "⚠️ **Entry Level**";
        analysis = `The **${moboName}** is a basic board.\n\n**Pros:** Cheap and functional.\n**Cons:**\n- Limited upgrade paths\n- Fewer USB/M.2 ports\n- May struggle with high-end power-hungry CPUs\n\n**Verdict:** Fine for i3/Ryzen 3, but consider upgrading to a **B-series** board for better longevity.`;
      } else {
        verdict = "💻 **Motherboard Check**";
        analysis = `You have the **${moboName}**.\n\nMake sure it matches your CPU (Intel vs AMD) and case size (ATX vs mATX).\n\nIf it has "WiFi" in the name, you're set for wireless internet! 📶`;
      }

      if (isITX) {
        analysis += `\n\n💡 **Note:** This is a **Mini-ITX** board. Make sure your case is compatible!`;
      }

      return {
        text: `## 🔌 Motherboard Analysis: ${moboName}\n\n${verdict}\n\n${analysis}`,
        suggestions: [
          "Is it compatible?",
          "Check connectivity",
          "Show my build",
        ],
      };
    } else {
      return {
        text: `## 🔌 Motherboard Analysis\n\nYou haven't selected a motherboard yet! Here's a quick guide:\n\n| CPU Brand | Best Value Chipset | Enthusiast Chipset |\n|-----------|--------------------|--------------------|\n| **Intel** | B760 | Z790 |\n| **AMD** | B650 | X670 |\n\n**Rule of Thumb:** Most gamers should buy **B-series** boards (B760/B650) to save money without losing gaming performance.`,
        suggestions: [
          "Best motherboard for gaming",
          "Budget motherboard",
          "Show my build",
        ],
      };
    }
    // Motherboard Analysis logic ends here...
  }

  // Cooler Analysis - "Is my cooler enough?"
  const coolerEnoughPattern =
    /(is my cooler|cooler enough|enough cooling|good cooler|good cooling)/i;
  if (coolerEnoughPattern.test(lower)) {
    const cooler = context.currentBuild?.parts?.cooler;
    const coolerName = cooler?.name || cooler?.title;
    const cpu = context.currentBuild?.parts?.cpu;
    const cpuName = cpu?.name || cpu?.title;

    if (coolerName) {
      let analysis = "";
      let verdict = "";

      // Cooler Type Detection
      const isAIO360 =
        /360|liquid|h150|kraken x7|kraken z7/i.test(coolerName) &&
        /liquid|aio|water/i.test(coolerName);
      const isAIO240 =
        /240|h100|kraken x5|kraken z5/i.test(coolerName) &&
        /liquid|aio|water/i.test(coolerName);
      const isAirHighEnd = /noctua|nh-d15|dark rock|ak620|assassin|fuma/i.test(
        coolerName,
      );
      const isAirBudget = /stock|stealth|wraith|hyper 212|ak400|gammaxx/i.test(
        coolerName,
      );

      // CPU Heat Estimation
      const isHotCpu = /i9|ryzen 9|14900|13900|7950|14700|13700|k/i.test(
        cpuName,
      );

      if (isAIO360) {
        verdict = "❄️ **Maximum Cooling!**";
        analysis = `The **${coolerName}** is a beast. \n\n**Performance:** Handles even the hottest i9/Ryzen 9 CPUs.\n**Noise:** Usually quieter due to large surface area.\n\n**Perfect for:** Overclocking and high-end workstations.`;
      } else if (isAIO240 || isAirHighEnd) {
        verdict = "✅ **Excellent Cooling**";
        analysis = `The **${coolerName}** handles high-end CPUs easily.\n\n**Performance:** Great for i7/Ryzen 7 and even stock i9s.\n**Reliability:** Top-tier air coolers last forever; AIOs look cleaner.\n\n**Verdict:** A solid choice for any powerful gaming rig.`;
      } else if (isAirBudget) {
        if (isHotCpu) {
          verdict = "⚠️ **Might Struggle**";
          analysis = `The **${coolerName}** is a budget cooler paired with a powerful CPU (${cpuName || "unknown"}).\n\n**Risk:** High temps and thermal limits under load.\n**Recommendation:** Upgrade to a dual-tower air cooler or 240mm AIO.`;
        } else {
          verdict = "✅ **Good for Budget Builds**";
          analysis = `The **${coolerName}** is fine for 65W CPUs (i5/Ryzen 5).\n\nIt gets the job done for gaming, but might run a bit loud under load using stock fan curves.`;
        }
      } else {
        verdict = "💻 **Cooler Check**";
        analysis = `You have the **${coolerName}**.\n\nMake sure it fits your case! Large air coolers need wide cases, and AIOs need radiator mounts.`;
      }

      return {
        text: `## ❄️ Cooler Analysis: ${coolerName}\n\n${verdict}\n\n${analysis}`,
        suggestions: ["Is it loud?", "Will it fit?", "Show my build"],
      };
    } else {
      return {
        text: `## ❄️ Cooler Analysis\n\nYou haven't picked a cooler! Here's a quick guide:\n\n| CPU Tier | Recommended Cooler |\n|----------|--------------------|\n| **i3 / Ryzen 5** | Budget Air ($20-40) |\n| **i5 / Ryzen 7** | Big Air / 240mm AIO ($50-100) |\n| **i7 / i9 / Ryzen 9** | 360mm AIO ($100+) |\n\n**Recommendation:** The **Thermalright Peerless Assassin** ($35) beats almost everything for value.`,
        suggestions: [
          "Best budget cooler",
          "Do I need liquid cooling?",
          "Show my build",
        ],
      };
    }
  }

  // Case Analysis - "Is my case good?"
  const caseEnoughPattern =
    /(is my case|case good|good case|case enough|enough airflow)/i;
  if (caseEnoughPattern.test(lower)) {
    const pccase = context.currentBuild?.parts?.case;
    const caseName = pccase?.name || pccase?.title;

    if (caseName) {
      let analysis = "";
      let verdict = "";

      const isFlow =
        /flow|mesh|air|breath|lancool|4000d|5000d|torrent|north/i.test(
          caseName,
        );
      const isGlass = /h9|o11|dynamic|fishtank|panorama|view/i.test(caseName);
      const isMini = /itx|nr200|terra|a4/i.test(caseName);

      if (isFlow) {
        verdict = "💨 **Superb Airflow!**";
        analysis = `The **${caseName}** is designed for performance.\n\n**Benefits:**\n- Mesh front for max intake\n- Keeps components cool\n- Usually easy to build in\n\n**Verdict:** Top choice for performance-focused builds.`;
      } else if (isGlass) {
        verdict = "✨ **Aesthetic King**";
        analysis = `The **${caseName}** is a showpiece case.\n\n**Benefits:**\n- Stunning view of components\n- Dual-chamber design often hides cables well\n\n**Note:** These often need lots of fans to look good and cool well!`;
      } else if (isMini) {
        verdict = "📦 **Compact Power**";
        analysis = `The **${caseName}** is a Small Form Factor (SFF) legend.\n\n**Warning:** SFF builds are tricky! Check GPU length and cooler height limits twice.`;
      } else {
        verdict = "💻 **Case Check**";
        analysis = `You have the **${caseName}**.\n\n**Checklist:**\n- Does your GPU fit? (Check max length)\n- Does it come with fans? (If not, buy 2-3)\n- Is there room for cable management?`;
      }

      return {
        text: `## 🖥️ Case Analysis: ${caseName}\n\n${verdict}\n\n${analysis}`,
        suggestions: ["Does GPU fit?", "Do I need fans?", "Show my build"],
      };
    } else {
      return {
        text: `## 🖥️ Case Recommendations\n\nYou haven't picked a case!\n\n| Style | Top Picks |\n|-------|-----------|\n| **Performance** | Corsair 4000D, Fraser North |\n| **Showcase** | Lian Li O11, NZXT H9 |\n| **Budget** | Montech Air 903, Deepcool CC560 |\n\n**Tip:** Always get a "Mesh" front panel for better cooling!`,
        suggestions: ["Best airflow case", "Best looking case", "Budget cases"],
      };
    }
  }

  // Monitor Analysis - "Is my monitor good?"
  const monitorEnoughPattern =
    /(is my monitor|monitor good|good monitor|monitor enough)/i;
  if (monitorEnoughPattern.test(lower)) {
    const monitor = context.currentBuild?.parts?.monitor;
    const monitorName = monitor?.name || monitor?.title;

    if (monitorName) {
      let analysis = "";
      let verdict = "";

      const is4K = /4k|uhd|2160p/i.test(monitorName);
      const is1440p = /1440p|2k|qhd/i.test(monitorName);
      const isHighRefresh = /144hz|165hz|170hz|240hz|360hz/i.test(monitorName);
      const isOLED = /oled|qd-oled/i.test(monitorName);

      if (isOLED) {
        verdict = "🌈 **Ultimate Visuals (OLED)**";
        analysis = `The **${monitorName}** uses OLED tech.\n\n**Pros:** Perfect blacks, instant response times, stunning HDR.\n**Cons:** Risk of burn-in (rare now) and text clarity.\n\n**Verdict:** The best gaming experience money can buy.`;
      } else if (is4K && isHighRefresh) {
        verdict = "🔥 **Top-End 4K Gaming**";
        analysis = `**${monitorName}** allows for sharp visuals AND smooth motion.\n\n**Requirement:** You need a beast GPU (RTX 4080/4090) to drive this properly.`;
      } else if (is1440p && isHighRefresh) {
        verdict = "✅ **The Gaming Sweet Spot**";
        analysis = `**1440p High Refresh** is the gold standard.\n\n**Why:** Sharp enough for detailed rpgs, fast enough for shooters. Best balance of performance and looks.`;
      } else {
        verdict = "💻 **Monitor Check**";
        analysis = `You have the **${monitorName}**.\n\n**Things to look for:**\n- **IPS Panel:** Best colors/viewing angles\n- **144Hz+:** Mandatory for gaming smoothness\n- **1ms Response:** standard for low blur.`;
      }

      return {
        text: `## 🖥️ Monitor Analysis: ${monitorName}\n\n${verdict}\n\n${analysis}`,
        suggestions: ["Is 4K worth it?", "OLED vs IPS", "Show my build"],
      };
    } else {
      return {
        text: `## 🖥️ Monitor Guide\n\nNo monitor selected yet! Here are the tiers:\n\n| Budget | Specs to Look For |\n|--------|-------------------|\n| **$150** | 1080p 144Hz IPS (Esports) |\n| **$300** | 1440p 165Hz IPS (Sweet Spot) |\n| **$600+** | 4K 144Hz or OLED |\n\n**Recommendation:** 1440p 165Hz is the best upgrade you can make for visual quality.`,
        suggestions: ["Best 1440p monitor", "Is 4K worth it?", "Show my build"],
      };
    }
  }

  // 🌀 FAN CHECK - "Does my build have fans?" / "Do I need fans?"
  const fanCheckPattern =
    /(do i have fans|does my build have fans|do i need fans|need fans|what fans|fans in my build|include fans|recommend.*fans|suggest.*fans)/i;
  if (fanCheckPattern.test(lower)) {
    const pccase = context.currentBuild?.parts?.case;
    const caseName = pccase?.name || pccase?.title;
    const cooler = context.currentBuild?.parts?.cooler;
    const coolerName = cooler?.name || cooler?.title;
    const gpu = context.currentBuild?.parts?.gpu;
    const gpuName = gpu?.name || gpu?.title || "";

    // Determine if case likely includes fans
    let caseFans = 0;
    let caseInfo = "";
    if (caseName) {
      // Most cases come with 1-3 fans
      if (/4000d|5000d|lancool|meshify|north|o11|nr200/i.test(caseName)) {
        caseFans = 2;
        caseInfo = `The **${caseName}** typically comes with **2 fans** included.`;
      } else if (/hyte|nzxt h|phanteks/i.test(caseName)) {
        caseFans = 3;
        caseInfo = `The **${caseName}** usually includes **3 fans** pre-installed.`;
      } else if (/nr200|meshlicious|ssupd/i.test(caseName)) {
        caseFans = 1;
        caseInfo = `The **${caseName}** (SFF case) typically comes with **1 fan** or none - check your specific model.`;
      } else {
        caseFans = 2;
        caseInfo = `Most cases like **${caseName}** come with **1-2 basic fans**.`;
      }
    }

    // Check if cooler is an AIO (has radiator fans)
    let coolerFans = 0;
    if (
      coolerName &&
      /aio|liquid|360|280|240|h150|h100|kraken|galahad|freezer/i.test(
        coolerName,
      )
    ) {
      if (/360/i.test(coolerName)) coolerFans = 3;
      else if (/280|240/i.test(coolerName)) coolerFans = 2;
      else coolerFans = 2;
    }

    // Determine heat level based on GPU
    let isHighHeat = /4090|4080|7900/i.test(gpuName);

    let response = `## 🌀 Fan Analysis for Your Build\n\n`;

    if (!caseName) {
      response += `❓ **No case selected yet!**\n\nOnce you pick a case, I can tell you how many fans it includes and if you need more.\n\n`;
      response += `### General Guidance\nMost builds need **3-5 fans** total:\n- **2 front intake** + **1 rear exhaust** = minimum\n- Add **2 top exhaust** for high-end GPUs\n\n`;
      response += `### 💡 Fan Recommendations\n| Budget | Fans | Price |\n|--------|------|-------|\n| **Budget** | Arctic P12 (5-pack) | ~$25 |\n| **Mid-Range** | Noctua NF-P12s | ~$25 each |\n| **RGB** | Lian Li SL-Infinity | ~$30 each |`;
    } else {
      response += caseInfo + `\n\n`;

      if (coolerFans > 0) {
        response += `Your **${coolerName}** AIO adds **${coolerFans} more fans** (on the radiator).\n\n`;
      }

      const totalFans = caseFans + coolerFans;
      response += `📊 **Estimated Total Fans: ${totalFans}**\n\n`;

      if (totalFans >= 5 || (totalFans >= 3 && !isHighHeat)) {
        response += `✅ **You likely have enough fans!** Your airflow should be good.\n\n`;
        response += `💡 **Tip:** Make sure fans are configured correctly:\n- **Front/Bottom** = Intake (air IN)\n- **Rear/Top** = Exhaust (air OUT)\n\n`;
        response += `Want me to describe your current setup in detail, or would you like to upgrade for better aesthetics or noise levels?`;
      } else {
        response += `⚠️ **You might need more fans**, especially ${isHighHeat ? "with your high-end GPU!" : "for optimal cooling."}\n\n`;
        response += `### 💡 Recommended Additions\n`;
        response += `| Location | Recommendation |\n|----------|----------------|\n`;
        if (caseFans < 2)
          response += `| **Front Intake** | Add 2x 120/140mm fans |\n`;
        if (caseFans < 3)
          response += `| **Top Exhaust** | Add 2x 120/140mm fans |\n`;
        response += `| **Rear Exhaust** | Usually included, verify |\n\n`;
        response += `### 🛒 Fan Recommendations\n| Budget | Fans | Price |\n|--------|------|-------|\n| **Budget** | Arctic P12 (5-pack) | ~$25 |\n| **Performance** | Noctua NF-A12x25 | ~$35 each |\n| **RGB** | Corsair iCUE SP120 (3-pack) | ~$80 |`;
      }
    }

    return trackedResponse("fan-check", {
      text: response,
      suggestions: ["Best case fans?", "RGB vs Performance", "Show my build"],
    });
  }

  // ❄️ CPU COOLER CHECK - "does my CPU need a cooler?" / "does CPU include cooler?"
  const cpuCoolerCheckPattern =
    /(cpu.*cooler|cooler.*cpu|need.*cooler|cpu.*include.*cool|does.*cpu.*come.*with|stock.*cooler|cpu.*have.*cooler|do i need.*cooler)/i;
  if (cpuCoolerCheckPattern.test(lower)) {
    const cpu = context.currentBuild?.parts?.cpu;
    const cooler = context.currentBuild?.parts?.cooler;
    const cpuName = cpu?.name || cpu?.title || "";
    const coolerName = cooler?.name || cooler?.title || "";

    // Extract budget - handle both number and object format
    let budget = context.budget || context.currentBuild?.budget || null;
    if (budget && typeof budget === "object") {
      budget = budget.amount || budget.value || budget.total || null;
    }
    if (budget && typeof budget !== "number") {
      budget = parseFloat(budget) || null;
    }

    // CPU cooler inclusion database
    const cpuHasCooler = (name) => {
      if (!name) return { included: false, type: "unknown" };
      const n = name.toLowerCase();

      // Intel - K/KF/KS SKUs do NOT include coolers
      if (/\d{4,5}k[sf]?$/i.test(n) || /i[3579]-\d{4,5}k/i.test(n)) {
        return { included: false, type: "Intel K-series (no cooler)" };
      }
      // Intel non-K includes basic cooler
      if (
        /i[3579]-\d{4,5}[ft]?(\s|$)/i.test(n) ||
        /i[3579]-\d{4,5}$/i.test(n)
      ) {
        return { included: true, type: "Intel Stock Cooler (basic, loud)" };
      }

      // AMD Ryzen - X3D, X suffix without Wraith
      if (/x3d/i.test(n)) {
        return { included: false, type: "AMD X3D (no cooler)" };
      }
      if (/7\d{3}x(?!3d)/i.test(n)) {
        return { included: false, type: "AMD 7000X-series (no cooler)" };
      }
      // AMD Ryzen 5000 series with cooler
      if (/5\d{3}(?!x)/i.test(n) || /5600g|5700g/i.test(n)) {
        return {
          included: true,
          type: "AMD Wraith Stealth (decent for stock)",
        };
      }
      // AMD Ryzen 7000 non-X
      if (/7\d{3}(?!x)/i.test(n) || /7600|7700|7800/i.test(n)) {
        return {
          included: false,
          type: "AMD 7000-series (no cooler typically)",
        };
      }

      return { included: false, type: "Unknown - check manufacturer specs" };
    };

    // Cooler recommendations by budget
    const coolerRecommendations = {
      budget: [
        {
          name: "ID-COOLING SE-214-XT",
          price: 20,
          type: "Air",
          tdp: "150W",
          note: "Best under $25",
        },
        {
          name: "Thermalright Assassin X 120",
          price: 25,
          type: "Air",
          tdp: "180W",
          note: "Incredible value",
        },
        {
          name: "DeepCool AK400",
          price: 35,
          type: "Air",
          tdp: "220W",
          note: "Great mid-range air",
        },
      ],
      mid: [
        {
          name: "Thermalright Peerless Assassin 120",
          price: 40,
          type: "Air",
          tdp: "260W",
          note: "Best value tower cooler",
        },
        {
          name: "Noctua NH-U12S Redux",
          price: 50,
          type: "Air",
          tdp: "200W",
          note: "Noctua quality, quiet",
        },
        {
          name: "Arctic Liquid Freezer II 240",
          price: 85,
          type: "AIO 240mm",
          tdp: "280W",
          note: "Best value AIO",
        },
      ],
      high: [
        {
          name: "Noctua NH-D15",
          price: 110,
          type: "Air",
          tdp: "300W",
          note: "Best air cooler ever made",
        },
        {
          name: "Arctic Liquid Freezer II 360",
          price: 110,
          type: "AIO 360mm",
          tdp: "350W",
          note: "Handles any CPU",
        },
        {
          name: "NZXT Kraken X63",
          price: 150,
          type: "AIO 280mm",
          tdp: "300W",
          note: "Great looks + performance",
        },
      ],
    };

    let response = `## ❄️ CPU Cooler Check\n\n`;

    if (!cpuName) {
      response += `❓ **No CPU selected yet!**\n\nOnce you pick a CPU, I'll tell you:\n- If it includes a stock cooler\n- Whether the stock cooler is good enough\n- Aftermarket upgrade options\n\n`;
      response += `**General Rule:**\n- Intel K/KF/KS CPUs → NO cooler included\n- AMD X3D/X-suffix → NO cooler included\n- Other CPUs → Usually include basic cooler`;

      return trackedResponse("cpu-cooler-no-cpu", {
        text: response,
        suggestions: ["Add a CPU", "Show cooler options", "Show my build"],
      });
    }

    const cpuInfo = cpuHasCooler(cpuName);
    response += `### Your CPU: ${cpuName}\n\n`;

    if (cpuInfo.included) {
      response += `✅ **Yes, this CPU includes a stock cooler!**\n\n`;
      response += `**Included:** ${cpuInfo.type}\n\n`;

      // Check if they already have an aftermarket cooler
      if (coolerName) {
        response += `You've already added **${coolerName}** - smart choice! Aftermarket coolers are quieter and keep temps lower.\n\n`;
      } else {
        response += `**Should you upgrade anyway?**\n`;
        response += `- Stock cooler is fine for **stock speeds**\n`;
        response += `- Upgrade if you want **lower temps** or **quieter operation**\n`;
        response += `- Required if you plan to **overclock**\n\n`;
      }
    } else {
      response += `⚠️ **No, this CPU does NOT include a cooler!**\n\n`;
      response += `**Type:** ${cpuInfo.type}\n\n`;

      if (coolerName) {
        response += `✅ Good news - you've already added **${coolerName}** to your build!\n\n`;
      } else {
        response += `🚨 **You MUST buy a cooler separately!** Your PC won't work without one.\n\n`;
      }
    }

    // Show recommendations if no cooler selected
    if (!coolerName) {
      response += `### 💡 Cooler Recommendations\n\n`;

      if (budget) {
        response += `💰 **Your Budget:** $${budget}\n\n`;
      } else {
        response += `*Tell me your budget (e.g., "I have $50 for a cooler") for personalized picks!*\n\n`;
      }

      // Determine which tier to show
      let tier = "budget";
      if (budget && budget >= 80) tier = "high";
      else if (budget && budget >= 40) tier = "mid";

      const recommendations = coolerRecommendations[tier];
      response += `| Cooler | Price | Type | Note |\n|--------|-------|------|------|\n`;
      for (const rec of recommendations) {
        if (!budget || rec.price <= budget) {
          response += `| **${rec.name}** | $${rec.price} | ${rec.type} | ${rec.note} |\n`;
        }
      }

      response += `\n**My Pick:** The **Thermalright Peerless Assassin** ($40) beats $100+ coolers!`;
    }

    return trackedResponse("cpu-cooler-check", {
      text: response,
      suggestions: coolerName
        ? ["Is my cooler enough?", "Show my build", "Any other issues?"]
        : ["$30 cooler budget", "$50 cooler budget", "Best value cooler"],
    });
  }

  // 🔧 BOTTLENECK FIX - "How do I fix the bottleneck?" / "Resolve bottleneck"
  // This handler must be checked BEFORE the general bottleneck questions handler
  const bottleneckFixPattern =
    /(fix.*bottleneck|bottleneck.*fix|resolve.*bottleneck|bottleneck.*solution|how.*fix.*bottleneck|how.*bottleneck|reduce.*bottleneck|remove.*bottleneck|eliminate.*bottleneck|bottleneck.*help|fix\s+the\s+bottleneck|fix\s+my\s+bottleneck)/i;
  if (bottleneckFixPattern.test(lower)) {
    const cpu = context.currentBuild?.parts?.cpu;
    const gpu = context.currentBuild?.parts?.gpu;
    const cpuName = cpu?.name || cpu?.title;
    const gpuName = gpu?.name || gpu?.title;
    const cpuScore = cpu?.score || 0;
    const gpuScore = gpu?.score || 0;

    // Extract budget - handle both number and object format
    let budget = context.budget || context.currentBuild?.budget || null;
    if (budget && typeof budget === "object") {
      budget = budget.amount || budget.value || budget.total || null;
    }
    if (budget && typeof budget !== "number") {
      budget = parseFloat(budget) || null;
    }

    if (!cpuName || !gpuName) {
      return trackedResponse("bottleneck-fix-empty", {
        text: `## 🔧 Bottleneck Analysis\n\nI need both a **CPU** and **GPU** in your build to check for bottlenecks!\n\n**What is a bottleneck?**\nIt's when one component limits another. For example:\n- A weak CPU can't feed a powerful GPU fast enough\n- A weak GPU wastes a powerful CPU's potential\n\n**Add both components** and I'll analyze your pairing.`,
        suggestions: ["Add a CPU", "Add a GPU", "Show my build"],
      });
    }

    // Determine tiers
    const getCpuTier = (name) => {
      if (!name) return "unknown";
      const n = name.toLowerCase();
      if (/i9|ryzen 9|7950|14900|13900/i.test(n)) return "enthusiast";
      if (/i7|ryzen 7|7800|7700|14700|13700/i.test(n)) return "high";
      if (/i5|ryzen 5|7600|13600|14600|13400/i.test(n)) return "mid";
      if (/i3|ryzen 3/i.test(n)) return "budget";
      return "unknown";
    };

    const getGpuTier = (name) => {
      if (!name) return "unknown";
      const n = name.toLowerCase();
      if (/4090|7900\s*xtx/i.test(n)) return "flagship";
      if (/4080|7900\s*xt(?!x)/i.test(n)) return "high";
      if (/4070|7800/i.test(n)) return "mid";
      if (/4060|7600|3060|6650|6700/i.test(n)) return "budget";
      return "unknown";
    };

    const cpuTier = getCpuTier(cpuName);
    const gpuTier = getGpuTier(gpuName);

    // GPU upgrade suggestions based on CPU tier
    const gpuUpgrades = {
      budget: {
        target: "RTX 4060 or RX 7600",
        reason: "matches budget CPU performance",
      },
      mid: {
        target: "RTX 4070 or RX 7800 XT",
        reason: "balanced for mid-range CPUs",
      },
      high: {
        target: "RTX 4080 or RX 7900 XT",
        reason: "matches high-end CPU capability",
      },
      enthusiast: {
        target: "RTX 4090 or RX 7900 XTX",
        reason: "maximizes your top-tier CPU",
      },
    };

    // CPU upgrade suggestions based on GPU tier
    const cpuUpgrades = {
      budget: {
        target: "Ryzen 5 7600X or i5-13400F",
        reason: "good for budget GPUs",
      },
      mid: {
        target: "Ryzen 7 7800X3D or i5-14600K",
        reason: "great for mid-tier gaming GPUs",
      },
      high: {
        target: "Ryzen 7 7800X3D or i7-14700K",
        reason: "handles high-end GPUs well",
      },
      flagship: {
        target: "Ryzen 9 7950X3D or i9-14900K",
        reason: "pairs with flagship GPUs",
      },
    };

    let response = `## 🔧 Bottleneck Fix: ${cpuName} + ${gpuName}\n\n`;

    if (budget && !isNaN(budget)) {
      response += `💰 **Your Budget:** $${budget}\n\n`;
    }

    let hasBottleneck = false;
    let severity = "none";
    let solution = "";

    // Analyze pairing
    const tierDiff = ["budget", "mid", "high", "flagship", "enthusiast"];
    const cpuIdx = tierDiff.indexOf(cpuTier);
    const gpuIdx = tierDiff.indexOf(gpuTier);

    if (cpuIdx !== -1 && gpuIdx !== -1) {
      const diff = cpuIdx - gpuIdx;

      if (diff >= 2) {
        // GPU bottleneck - GPU is much weaker than CPU
        hasBottleneck = true;
        severity = "moderate";
        const upgrade = gpuUpgrades[cpuTier] || gpuUpgrades["mid"];
        let budgetNote = "";
        if (budget) {
          if (budget >= 600)
            budgetNote = `\n\n💰 **Within your $${budget} budget:** RTX 4070 Super ($599) or RX 7800 XT ($499)`;
          else if (budget >= 300)
            budgetNote = `\n\n💰 **Within your $${budget} budget:** RTX 4060 ($299) or RX 7600 ($269)`;
          else
            budgetNote = `\n\n💰 **Budget tip:** Save up to ~$300 for meaningful GPU upgrade, or look for used GPUs.`;
        }
        solution = `### 🎮 GPU is the Bottleneck\n\nYour **${cpuName}** is much stronger than your **${gpuName}**.\n\n**Impact:** Your CPU is waiting around while the GPU struggles. You're not getting the frames your CPU could support.\n\n**Solution:** Upgrade your GPU\n\n| Recommended GPU | Price | Why |\n|-----------------|-------|-----|\n| **${upgrade.target}** | ~$400-600 | ${upgrade.reason} |${budgetNote}\n\n**At Higher Resolutions:** This bottleneck becomes less noticeable at 1440p/4K.`;
      } else if (diff <= -2) {
        // CPU bottleneck - CPU is much weaker than GPU
        hasBottleneck = true;
        severity = "significant";
        const upgrade = cpuUpgrades[gpuTier] || cpuUpgrades["mid"];
        let budgetNote = "";
        if (budget) {
          if (budget >= 400)
            budgetNote = `\n\n💰 **Within your $${budget} budget:** Ryzen 7 7800X3D ($399) - best gaming CPU!`;
          else if (budget >= 200)
            budgetNote = `\n\n💰 **Within your $${budget} budget:** Ryzen 5 7600X ($229) or i5-13400F ($189)`;
          else
            budgetNote = `\n\n💰 **Budget tip:** Save up to ~$200 for a worthwhile CPU upgrade.`;
        }
        solution = `### 🧠 CPU is the Bottleneck\n\nYour **${gpuName}** is much stronger than your **${cpuName}**.\n\n**Impact:** Your GPU isn't being fed fast enough! You'll see:\n- Lower FPS than expected\n- GPU usage below 90-100%\n- Stuttering in CPU-heavy games\n\n**Solution:** Upgrade your CPU\n\n| Recommended CPU | Price | Why |\n|-----------------|-------|-----|\n| **${upgrade.target}** | ~$200-400 | ${upgrade.reason} |${budgetNote}\n\n**Quick Fixes (free!):**\n- Play at **higher resolutions** (4K > 1440p > 1080p)\n- Enable **DLSS/FSR Frame Generation**\n- Lower CPU-heavy settings`;
      } else if (Math.abs(diff) === 1) {
        hasBottleneck = true;
        severity = "minor";
        solution = `### ⚖️ Minor Imbalance Detected\n\nYour **${cpuName}** and **${gpuName}** are close but not perfectly matched.\n\n**Impact:** You might lose 5-10% performance in some scenarios - usually not noticeable.\n\n**Verdict:** ✅ **No action needed!**\n\nThis is within acceptable range. You can optimize by:\n- Using DLSS/FSR to reduce GPU load\n- Closing background apps to free CPU\n- Enabling XMP/EXPO for RAM speed boost`;
      }
    }

    if (!hasBottleneck) {
      response += `### ✅ Great News: No Bottleneck Detected!\n\nYour **${cpuName}** and **${gpuName}** are well-matched.\n\n**Tips for Maximum Performance:**\n- Enable XMP/EXPO for your RAM\n- Update GPU drivers regularly\n- Use DLSS/FSR for free frames\n- Monitor temps to ensure no thermal throttling`;
    } else {
      response += `### ⚠️ Bottleneck Severity: ${severity.toUpperCase()}\n\n${solution}`;
    }

    return trackedResponse("bottleneck-fix", {
      text: response,
      suggestions: hasBottleneck
        ? ["Show upgrade options", "Ignore and continue", "Show my build"]
        : ["Check compatibility", "Any other issues?", "Show my build"],
    });
  }

  // 💡 UPGRADE SUGGESTIONS - "suggest a better CPU/GPU" / "help me upgrade" / "what should I upgrade"
  const upgradePattern =
    /(suggest.*better|help.*upgrade|what.*upgrade|upgrade.*suggest|recommend.*upgrade|better.*cpu|better.*gpu|better.*motherboard|better.*mobo|improve.*build|upgrade.*build|what.*should.*i.*upgrade|any.*upgrades|need.*upgrade)/i;
  if (upgradePattern.test(lower)) {
    const parts = context.currentBuild?.parts;

    // Extract budget - handle both number and object format
    let budget = context.budget || context.currentBuild?.budget || null;
    if (budget && typeof budget === "object") {
      budget = budget.amount || budget.value || budget.total || null;
    }
    if (budget && typeof budget !== "number") {
      budget = parseFloat(budget) || null;
    }

    if (!parts || Object.keys(parts).filter((k) => parts[k]).length === 0) {
      return trackedResponse("upgrade-empty", {
        text: `## 💡 Upgrade Suggestions\n\nYou haven't added any parts to your build yet!\n\nOnce you add components, I'll analyze them and suggest upgrades based on:\n- **Age** - Are they last-gen?\n- **Performance balance** - Does one part hold back others?\n- **Your budget** - What can you afford?\n\n**Tip:** Tell me your budget, like "I have $500 for upgrades"`,
        suggestions: ["$500 budget", "$1000 budget", "Start a new build"],
      });
    }

    // Part generation/age detection
    const getPartGeneration = (name, category) => {
      if (!name) return { gen: "unknown", age: 0, isOld: false };
      const n = name.toLowerCase();

      if (category === "cpu") {
        // Intel generations
        if (/14\d{3}|14th/i.test(n))
          return { gen: "14th Gen Intel", age: 0, isOld: false };
        if (/13\d{3}|13th/i.test(n))
          return { gen: "13th Gen Intel", age: 1, isOld: false };
        if (/12\d{3}|12th/i.test(n))
          return { gen: "12th Gen Intel", age: 2, isOld: true };
        if (/11\d{3}|11th|10\d{3}|10th/i.test(n))
          return { gen: "10th/11th Gen Intel", age: 3, isOld: true };
        // AMD generations
        if (/7\d{3}x|zen\s*4|9\d{3}x3d/i.test(n))
          return { gen: "Ryzen 7000 (Zen 4)", age: 0, isOld: false };
        if (/5\d{3}x|zen\s*3/i.test(n))
          return { gen: "Ryzen 5000 (Zen 3)", age: 2, isOld: true };
        if (/3\d{3}x|zen\s*2/i.test(n))
          return { gen: "Ryzen 3000 (Zen 2)", age: 4, isOld: true };
      }

      if (category === "gpu") {
        // NVIDIA
        if (/rtx\s*40|4090|4080|4070|4060/i.test(n))
          return { gen: "RTX 40-series", age: 0, isOld: false };
        if (/rtx\s*30|3090|3080|3070|3060/i.test(n))
          return { gen: "RTX 30-series", age: 2, isOld: true };
        if (/rtx\s*20|2080|2070|2060/i.test(n))
          return { gen: "RTX 20-series", age: 4, isOld: true };
        if (/gtx\s*16|1660|1650/i.test(n))
          return { gen: "GTX 16-series", age: 4, isOld: true };
        // AMD
        if (/rx\s*7\d{3}|7900|7800|7700|7600/i.test(n))
          return { gen: "RX 7000-series", age: 0, isOld: false };
        if (/rx\s*6\d{3}|6900|6800|6700|6600/i.test(n))
          return { gen: "RX 6000-series", age: 2, isOld: true };
      }

      if (category === "motherboard") {
        // Intel chipsets
        if (/z790|b760|h770/i.test(n))
          return { gen: "700-series (Current)", age: 0, isOld: false };
        if (/z690|b660|h670/i.test(n))
          return { gen: "600-series", age: 1, isOld: false };
        if (/z590|b560|h510/i.test(n))
          return { gen: "500-series", age: 3, isOld: true };
        // AMD chipsets
        if (/x670|b650|a620/i.test(n))
          return { gen: "AM5 (Current)", age: 0, isOld: false };
        if (/x570|b550|a520/i.test(n))
          return { gen: "AM4", age: 2, isOld: false };
      }

      if (category === "ram") {
        if (/ddr5/i.test(n))
          return { gen: "DDR5 (Current)", age: 0, isOld: false };
        if (/ddr4/i.test(n)) return { gen: "DDR4", age: 2, isOld: true };
      }

      return { gen: "Unknown", age: 0, isOld: false };
    };

    // Upgrade recommendations database
    const upgradeOptions = {
      cpu: {
        budget: [
          {
            name: "Ryzen 5 7600X",
            price: 229,
            advantage: "Great gaming value with DDR5 support",
          },
          {
            name: "Intel i5-13400F",
            price: 189,
            advantage: "Best budget option, works with DDR4 or DDR5",
          },
        ],
        mid: [
          {
            name: "Ryzen 7 7800X3D",
            price: 399,
            advantage: "Best gaming CPU period - massive cache",
          },
          {
            name: "Intel i5-14600K",
            price: 319,
            advantage: "Great for gaming + productivity",
          },
        ],
        high: [
          {
            name: "Ryzen 9 7950X3D",
            price: 649,
            advantage: "Ultimate gaming + productivity",
          },
          {
            name: "Intel i7-14700K",
            price: 409,
            advantage: "Excellent all-rounder",
          },
        ],
      },
      gpu: {
        budget: [
          {
            name: "RTX 4060",
            price: 299,
            advantage: "1080p gaming with DLSS 3",
          },
          {
            name: "RX 7600",
            price: 269,
            advantage: "1080p gaming, great value",
          },
        ],
        mid: [
          {
            name: "RTX 4070 Super",
            price: 599,
            advantage: "1440p gaming champion",
          },
          { name: "RX 7800 XT", price: 499, advantage: "Best 1440p value" },
        ],
        high: [
          { name: "RTX 4080 Super", price: 999, advantage: "4K gaming ready" },
          {
            name: "RTX 4090",
            price: 1599,
            advantage: "Absolute best, no compromises",
          },
        ],
      },
    };

    // Analyze each part
    const upgradeCandidates = [];
    const categoryLabels = {
      cpu: "CPU",
      gpu: "GPU",
      motherboard: "Motherboard",
      ram: "RAM",
      storage: "Storage",
      psu: "PSU",
      cooler: "Cooler",
    };

    for (const [category, part] of Object.entries(parts)) {
      if (!part) continue;
      const partName = part.name || part.title;
      const partGen = getPartGeneration(partName, category);

      if (partGen.isOld && upgradeOptions[category]) {
        upgradeCandidates.push({
          category,
          label: categoryLabels[category] || category,
          currentPart: partName,
          generation: partGen.gen,
          ageYears: partGen.age,
          upgrades: upgradeOptions[category],
        });
      }
    }

    let response = `## 💡 Upgrade Analysis for Your Build\n\n`;

    if (budget) {
      response += `💰 **Your Budget:** $${budget}\n\n`;
    } else {
      response += `💡 **Tip:** Tell me your upgrade budget (e.g., "I have $500") for personalized suggestions!\n\n`;
    }

    if (upgradeCandidates.length === 0) {
      response += `### ✅ Your Build Looks Current!\n\nNo outdated components detected. Your parts are up-to-date.\n\n`;
      response += `**If you still want to upgrade:**\n`;
      response += `- Tell me your budget and goals\n`;
      response += `- Ask about a specific component ("is my GPU enough?")\n`;
      response += `- Check for bottlenecks`;
    } else {
      response += `### 📊 Components That Could Use an Upgrade\n\n`;

      for (const candidate of upgradeCandidates) {
        response += `#### ⚡ ${candidate.label}: ${candidate.currentPart}\n`;
        response += `*Generation: ${candidate.generation}* (~${candidate.ageYears} years old)\n\n`;

        // Suggest upgrades based on budget tier
        let tier = "budget";
        if (budget && budget >= 500) tier = "mid";
        if (budget && budget >= 800) tier = "high";

        const suggestions =
          candidate.upgrades[tier] || candidate.upgrades.budget;
        if (suggestions) {
          response += `| Upgrade Option | Price | Why |\n|----------------|-------|-----|\n`;
          for (const opt of suggestions) {
            if (!budget || opt.price <= budget) {
              response += `| **${opt.name}** | $${opt.price} | ${opt.advantage} |\n`;
            }
          }
          response += `\n`;
        }
      }

      response += `---\n\n**Priority:** ${upgradeCandidates.find((c) => c.category === "gpu") ? "GPU upgrades give the biggest FPS boost for gaming!" : "CPU upgrade recommended for better overall performance."}`;
    }

    return trackedResponse("upgrade-suggestions", {
      text: response,
      suggestions: budget
        ? ["Apply upgrades", "Different budget", "Show my build"]
        : ["$300 budget", "$500 budget", "$1000 budget"],
    });

    // --- FALLBACKS (If no specific handler caught the message) ---
    const fallbacks = [
      {
        text: "Hmm, I'm not totally sure what you mean there. But if you've got a PC question, I'm all ears! 👂\n\nTry telling me your **budget** or ask about a specific **part**.",
        suggestions: [
          "$1000 gaming PC",
          "Best GPU right now?",
          "Help me get started",
        ],
      },
      {
        text: "I gotcha! Let me know what you're looking for:\n\n• A **full PC build** (just drop a budget)\n• Info on **specific parts**\n• Help with **upgrades**\n\nWhat sounds good?",
        suggestions: [
          "Gaming PC $1500",
          "Best CPU for gaming?",
          "Upgrade advice",
        ],
      },
      {
        text: "Hey, I'm here to help you build something awesome! 💻\n\nJust give me a **budget** and tell me what you'll use it for (gaming, work, streaming) and I'll make it happen.",
        suggestions: ["$1000 build", "$2000 build", "What should I get?"],
      },
    ];

    // Pick a random fallback for variety
    logFallback(message);
    const randomFallback =
      fallbacks[Math.floor(Math.random() * fallbacks.length)];
    return appendEntityConfirmation(randomFallback);
  }

  const partQueries = [
    {
      pattern: /(what is my ram|what ram|show my ram|my ram$|my memory$)/i,
      key: "ram",
      label: "RAM",
    },
    {
      pattern:
        /(what is my storage|what storage|show my storage|my storage$|my ssd$)/i,
      key: "storage",
      label: "Storage",
    },
    {
      pattern:
        /(what is my psu|what psu|show my psu|my psu$|my power supply$)/i,
      key: "psu",
      label: "PSU",
    },
    {
      pattern: /(what is my case|what case|show my case|my case$)/i,
      key: "case",
      label: "Case",
    },
    {
      pattern: /(what is my cooler|what cooler|show my cooler|my cooler$)/i,
      key: "cooler",
      label: "Cooler",
    },
    {
      pattern:
        /(what is my motherboard|what motherboard|show my motherboard|my motherboard$|my mobo$)/i,
      key: "motherboard",
      label: "Motherboard",
    },
    {
      pattern: /(what is my monitor|what monitor|show my monitor|my monitor$)/i,
      key: "monitor",
      label: "Monitor",
    },
  ];

  for (const { pattern, key, label } of partQueries) {
    if (pattern.test(lower)) {
      const part = context.currentBuild?.parts?.[key];
      if (part && (part.name || part.title)) {
        const partName = part.name || part.title;
        return {
          text: `## 💻 Your ${label}\n\nYou have the **${partName}** in your build.${part.price ? `\n\n**Price:** $${part.price}` : ""}\n\nWant me to check if it's compatible with your other parts, or analyze if it's enough for your needs?`,
          suggestions: [
            `Is my ${label} enough?`,
            "Check compatibility",
            "Show my full build",
          ],
        };
      } else {
        return {
          text: `## 💻 ${label} Not Selected\n\nYou haven't added a ${label.toLowerCase()} to your build yet.\n\nWant me to recommend one based on your other parts?`,
          suggestions: [
            `Best ${label} for gaming`,
            `Budget ${label}`,
            "Show my build",
          ],
        };
      }
    }
  }

  // === PERSONALITY RESPONSES ===

  // Friendly: Thank you responses
  if (/thank|thanks|thx|ty|appreciate/i.test(lower)) {
    const thankResponses = [
      `You're welcome! If you have more questions about your build, feel free to ask. 😊`,
      `Happy to help! Let me know if you need anything else for your PC.`,
      `Anytime! Good luck with your build - I'm here if you get stuck.`,
    ];
    return {
      text: thankResponses[Math.floor(Math.random() * thankResponses.length)],
      suggestions: ["Show my build", "Any other tips?", "Check compatibility"],
    };
  }

  // Helpful empathy: Confused/need help
  if (
    /confused|don't understand|lost|overwhelmed|help me|idk|i don't know/i.test(
      lower,
    )
  ) {
    return {
      text: `Don't worry, I'm here to help clarify things! PC building can seem overwhelming at first.\n\nWhat specifically would you like help with?\n- Choosing components?\n- Understanding specs?\n- Compatibility questions?`,
      suggestions: [
        "Explain PC parts",
        "Help me pick a GPU",
        "Start from scratch",
      ],
    };
  }

  // Friendly intro when asked "who are you" or "what can you do"
  if (/who are you|what are you|what can you do|what do you do/i.test(lower)) {
    return {
      text: `I'm Nexus, your PC building assistant! 🖥️\n\nI can help you:\n- **Build a PC** within your budget\n- **Compare components** (CPUs, GPUs, etc.)\n- **Check compatibility** of your parts\n- **Troubleshoot** common PC issues\n\nJust tell me your budget or ask any PC question!`,
      suggestions: [
        "Build me a $1500 PC",
        "Best GPU for gaming?",
        "Check my build",
      ],
    };
  }

  // === BEGINNER-FRIENDLY PC EXPLANATIONS ===

  // Simple: What is a CPU?
  if (
    /what('s| is).*(a )?(cpu|processor)/i.test(lower) &&
    !/best|good|recommend/i.test(lower)
  ) {
    return {
      text: `**CPU = The brain of your PC!** 🧠\n\nIt executes instructions fast and handles everything from opening apps to running games.\n\n**Key specs:**\n- **Cores:** More = better multitasking\n- **Clock speed:** Higher GHz = faster single tasks\n- **Brand:** AMD Ryzen or Intel Core`,
      suggestions: [
        "Best CPU for gaming?",
        "AMD vs Intel?",
        "How many cores need?",
      ],
    };
  }

  // Simple: What is a GPU?
  if (
    /what('s| is).*(a )?(gpu|graphics card)/i.test(lower) &&
    !/best|good|recommend/i.test(lower)
  ) {
    return {
      text: `**GPU = Graphics card, makes games look awesome!** 🎮\n\nIt renders all the visuals – games, videos, 3D graphics.\n\n**Key specs:**\n- **VRAM:** More = higher resolution textures (8GB+ for 1440p)\n- **Brand:** NVIDIA RTX or AMD Radeon RX`,
      suggestions: [
        "Best GPU for gaming?",
        "NVIDIA vs AMD?",
        "How much VRAM need?",
      ],
    };
  }

  // Simple: What is RAM?
  if (
    /what('s| is).*(a )?(ram|memory)/i.test(lower) &&
    !/best|good|recommend|how much/i.test(lower)
  ) {
    return {
      text: `**RAM = Memory, helps apps run smoothly!** 💨\n\nIt stores data temporarily so apps can access it quickly.\n\n**Key specs:**\n- **Amount:** 16GB good, 32GB ideal\n- **Speed:** DDR5 faster than DDR4\n- **Tip:** RAM must match motherboard (DDR4 or DDR5)`,
      suggestions: ["How much RAM need?", "DDR4 vs DDR5?", "16GB vs 32GB?"],
    };
  }

  // Simple: What is Storage?
  if (
    /what('s| is).*(a )?(storage|ssd|hdd|hard drive)/i.test(lower) &&
    !/best|good|recommend|how much/i.test(lower)
  ) {
    return {
      text: `**Storage = Where your files, apps, and games live!** 💾\n\n**Types:**\n- **SSD (NVMe):** Super fast, games load in seconds\n- **SSD (SATA):** Fast, cheaper than NVMe\n- **HDD:** Slow but cheap, good for file storage\n\n**Tip:** Get an NVMe SSD for Windows + games, HDD for files!`,
      suggestions: [
        "NVMe vs SATA?",
        "How much storage need?",
        "Best SSD for gaming",
      ],
    };
  }

  // Simple: What is Motherboard?
  if (
    /what('s| is).*(a )?(motherboard|mobo)/i.test(lower) &&
    !/best|good|recommend/i.test(lower)
  ) {
    return {
      text: `**Motherboard = Main circuit board, connects everything!** 🔌\n\nIt's the backbone – CPU, GPU, RAM all plug into it.\n\n**Key specs:**\n- **Socket:** Must match your CPU (AM5, LGA 1700)\n- **Chipset:** Determines features (B650, Z790)\n- **Size:** ATX, Micro ATX, Mini ITX`,
      suggestions: [
        "Best motherboard for Ryzen?",
        "B650 vs X670?",
        "What size motherboard?",
      ],
    };
  }

  // Simple: What is PSU?
  if (
    /what('s| is).*(a )?(psu|power supply)/i.test(lower) &&
    !/best|good|recommend|watt/i.test(lower)
  ) {
    return {
      text: `**Power Supply = Gives power to all your parts!** ⚡\n\nWithout enough power, your PC won't work (or will crash).\n\n**Key specs:**\n- **Wattage:** 550W budget, 750W gaming, 850W+ high-end\n- **Efficiency:** 80+ Bronze/Gold/Platinum\n- **Tip:** Never cheap out – bad PSU can fry parts!`,
      suggestions: [
        "What wattage need?",
        "Best PSU brands?",
        "80+ ratings explained",
      ],
    };
  }

  // Simple: What is Case?
  if (
    /what('s| is).*(a )?(case|chassis)/i.test(lower) &&
    !/best|good|recommend/i.test(lower)
  ) {
    return {
      text: `**Case = Outer casing, holds everything together!** 🖥️\n\nIt protects parts and affects airflow (cooling).\n\n**Sizes:**\n- **Full Tower:** Big, lots of room\n- **Mid Tower:** Most popular, balanced\n- **Mini ITX:** Compact, less airflow\n\n**Tip:** Good airflow cases keep parts cool and quiet!`,
      suggestions: [
        "Best airflow case?",
        "Mini vs Mid tower?",
        "RGB case options",
      ],
    };
  }

  // === TROUBLESHOOTING PATTERNS ===

  // PC is slow
  if (
    /(pc|computer).*(slow|sluggish|laggy)|slow (pc|computer)/i.test(lower) &&
    !/game/i.test(lower)
  ) {
    return {
      text: `**PC Running Slow? Try these fixes:** 🔧\n\n1. **Close unused apps** - Check Task Manager (Ctrl+Shift+Esc)\n2. **Disable startup programs** - Task Manager > Startup\n3. **Check storage** - SSDs under 10% free space slow down\n4. **Scan for malware** - Windows Defender scan\n5. **Upgrade RAM** - If under 16GB, that's likely the issue!\n\nStill slow? It might be time for a hardware upgrade.`,
      suggestions: ["Upgrade RAM", "Replace with SSD", "Full PC upgrade?"],
    };
  }

  // Games lag / low FPS
  if (
    /(game|games).*(lag|laggy|stutter|slow)|lag.*(game|gaming)|low fps|fps drop/i.test(
      lower,
    )
  ) {
    return {
      text: `**Games Lagging? Here's what to check:** 🎮\n\n1. **Update GPU drivers** - NVIDIA GeForce or AMD Adrenalin\n2. **Lower graphics settings** - Start with shadows and anti-aliasing\n3. **Close background apps** - Discord, Chrome eat RAM\n4. **Check temps** - Overheating causes throttling\n5. **Enable DLSS/FSR** - Free FPS boost!\n\nIf still laggy, your GPU might need an upgrade.`,
      suggestions: [
        "Best GPU upgrade?",
        "How to check temps?",
        "What is DLSS?",
      ],
    };
  }

  // === 🧠 NEW KNOWLEDGE QUERIES ===

  // Workstation / Productivity
  if (
    matchesSynonymGroup(lower, "work") ||
    /(video edit|render|blender|premiere|davinci|code|compile|workstation)/i.test(
      lower,
    )
  ) {
    if (/video|edit|premiere/i.test(lower)) {
      const info = WORKSTATION_KNOWLEDGE.videoEditing;
      return {
        text: `**${info.title} Info:** 🎥\n\n**Best Components:**\n- **CPU:** ${info.priorities.find((p) => p.component === "CPU").note}\n- **GPU:** ${info.priorities.find((p) => p.component === "GPU").note}\n- **RAM:** ${info.priorities.find((p) => p.component === "RAM").note}\n\nFor **Premiere Pro**, prioritize Intel CPUs (QuickSync). For **DaVinci Resolve**, prioritize GPU VRAM!`,
        suggestions: [
          "Best CPU for Premiere",
          "Best GPU for DaVinci",
          "How much RAM for editing?",
        ],
      };
    }
    if (/render|3d|blender/i.test(lower)) {
      const info = WORKSTATION_KNOWLEDGE.rendering3D;
      return {
        text: `**${info.title} Info:** 🎨\n\n**Rendering Engines:**\n- **CPU Rendering:** Best with Threadripper/Ryzen 9 (Multi-core beasts).\n- **GPU Rendering:** Best with NVIDIA RTX 4090 (OptiX is fastest).\n\n**Recommendation:** NVIDIA GPUs are vastly superior for Blender due to OptiX support.`,
        suggestions: [
          "Best GPU for Blender",
          "CPU vs GPU rendering",
          "Workstation build",
        ],
      };
    }
  }

  // Monitor Questions
  if (
    /(monitor|display|screen|oled|ips|panel|hz|refresh rate)/i.test(lower) &&
    !/best|recommend/i.test(lower)
  ) {
    if (/oled/i.test(lower)) {
      const info = MONITOR_KNOWLEDGE.panels.OLED;
      return {
        text: `**OLED Monitors:**\n\n**Pros:** ${info.pros.join(", ")}\n**Cons:** ${info.cons.join(", ")}\n**Best For:** ${info.bestFor.join(", ")}\n\nThey look incredible but beware of burn-in with static desktop elements!`,
        suggestions: ["OLED vs IPS", "Best OLED monitor", "Is burn-in real?"],
      };
    }
    if (/ips/i.test(lower)) {
      const info = MONITOR_KNOWLEDGE.panels.IPS;
      return {
        text: `**IPS Monitors:**\n\n**Pros:** ${info.pros.join(", ")}\n**Cons:** ${info.cons.join(", ")}\n**Verdict:** The standard for gaming and color work. Best balance of speed and image quality.`,
        suggestions: ["IPS vs VA", "Best IPS monitor", "What is IPS glow?"],
      };
    }
    // General Monitor Guide
    return {
      text: `**Monitor Quick Guide:** 🖥️\n\n- **1080p:** Good for 24", budget/esports.\n- **1440p:** The sweet spot (27"). Best balance.\n- **4K:** Crystal clear (32"+), requires massive GPU power.\n\n**Panel Types:**\n- **IPS:** Great colors, fast.\n- **OLED:** Perfect blacks, instant response.\n- **VA:** Deep contrast, cheap, but smearing.`,
      suggestions: ["Best 1440p monitor", "OLED vs IPS", "What size monitor?"],
    };
  }

  // Audio Questions
  if (/(audio|sound|headphone|headset|mic|microphone|dac|amp)/i.test(lower)) {
    if (/mic|microphone/i.test(lower)) {
      const info = AUDIO_KNOWLEDGE.microphones;
      return {
        text: `**Microphone Guide:** 🎙️\n\n- **Dynamic (e.g. SM7B):** Rejects background noise (good for noisy rooms).\n- **Condenser (e.g. Blue Yeti):** Very sensitive, captures detail (needs quiet room).\n\n**USB vs XLR:** USB is plug-and-play. XLR needs an interface but sounds better.`,
        suggestions: [
          "Best USB mic",
          "Should I get XLR?",
          "Best streaming mic",
        ],
      };
    }
    if (/dac|amp/i.test(lower)) {
      return {
        text: `**DAC/Amp Guide:** 🎛️\n\n- **Do you need one?** Probably not for gaming headsets.\n- **When to buy:** If you have high-impedance headphones (250 ohm+) or hear static.\n- **Budget King:** Apple USB-C Dongle ($9) is essentially a high-quality DAC!`,
        suggestions: [
          "What is a DAC?",
          "Best budget DAC",
          "Headphone impedance explained",
        ],
      };
    }
    // Headphones
    const info = AUDIO_KNOWLEDGE.headphones.types;
    return {
      text: `**Headphones Guide:** 🎧\n\n- **Open Back:** Wide soundstage (immersive), zero isolation. (Best for FPS)\n- **Closed Back:** Good isolation, more bass. (Best for noisy rooms)\n- **IEMs:** In-Ear Monitors. Great value & imaging.\n\n**Recommendation:** Sennheiser HD 560S (Open) or HyperX Cloud II (Closed).`,
      suggestions: [
        "Best open back headphones",
        "IEMs for gaming",
        "Wireless headsets",
      ],
    };
  }

  // PSU Questions
  if (/(psu|power supply|tier list|explode|bomb|safe)/i.test(lower)) {
    if (/tier|list/i.test(lower) || /safe|explode/i.test(lower)) {
      return {
        text: `**PSU Tier List (Safety):** ⚡\n\n- **Tier A:** Top tier/High-end (Corsair RMx, Seasonic Focus)\n- **Tier B:** Mid-range (Reliable for most builds)\n- **Tier F:** **DANGEROUS** (Replace immediately!)\n\n**Never cheap out on the PSU!** It's the one part that can kill your whole PC.`,
        suggestions: [
          "Best Tier A PSU",
          "Is my PSU safe?",
          "How many watts need?",
        ],
      };
    }
  }

  // Peripherals (Keyboard/Mouse)
  if (/(keyboard|mouse|switch|sensor|dpi|mechanical|clicky)/i.test(lower)) {
    if (/keyboard|switch|clicky/i.test(lower)) {
      const info = PERIPHERALS_DEEP_DIVE.keyboards.switches;
      return {
        text: `**Mechanical Switch Guide:** ⌨️\n\n- **Linear (Red):** Smooth, quiet. Best for gaming.\n- **Tactile (Brown):** Bump feeling. Good middle ground.\n- **Clicky (Blue):** Loud click. Great for typing, annoying for friends.\n- **Rapid Trigger:** New tech (Wooting/Razer) for instant response in FPS games.`,
        suggestions: [
          "Best gaming keyboard",
          "What is Rapid Trigger?",
          "Red vs Blue switches",
        ],
      };
    }
    if (/mouse|dpi|sensor/i.test(lower)) {
      const info = PERIPHERALS_DEEP_DIVE.mice;
      return {
        text: `**Mouse Quick Guide:** 🖱️\n\n- **Shape:** King. Comfort > Specs.\n- **Weight:** Lightweight (<60g) is best for FPS aim.\n- **Polling Rate:** 1000Hz is standard. 4000Hz is niche.\n- **DPI:** Marketing gimmick. 800-1600 is all you need.`,
        suggestions: [
          "Best lightweight mouse",
          "Wireless vs Wired",
          "Claw grip mouse",
        ],
      };
    }
  }

  // Roast My Build (Fun Mode)
  if (/(roast|rate|judge).*(my|this).*(build|setup|pc)/i.test(lower)) {
    const build = context.currentBuild || {};
    const parts = build.parts || {};
    let roasts = [];

    // Brand Roasts
    Object.keys(ROAST_LOGIC.brands).forEach((brand) => {
      if (JSON.stringify(parts).includes(brand))
        roasts.push(ROAST_LOGIC.brands[brand]);
    });

    // Logical Roasts (Bottlenecks/Bad Value)
    if (parts.cpu && parts.gpu) {
      Object.values(ROAST_LOGIC.bottlenecks).forEach((rule) => {
        if (rule.check(parts.cpu, parts.gpu))
          roasts.push(
            rule.roast
              .replace("${cpu}", parts.cpu.name)
              .replace("${gpu}", parts.gpu.name),
          );
      });
    }

    // Generic fallback if build is decent
    if (roasts.length === 0)
      roasts.push(
        ROAST_LOGIC.generic[
          Math.floor(Math.random() * ROAST_LOGIC.generic.length)
        ],
      );

    return {
      text: `**🔥 ROAST MODE ACTIVATED 🔥**\n\n${roasts.join("\n\n")}\n\n*(I'm just kidding... mostly. Need help fixing it?)*`,
      suggestions: ["Fix my build", "Roast me harder", "Optimize it"],
    };
  }

  // Prebuilt Analysis
  if (/(prebuilt|pre-built).*(good|worth|scam|buy)/i.test(lower)) {
    return {
      text: `**🛡️ Prebuilt Protection Mode:**\n\n**Red Flags to Watch:**\n- **"i7 Gaming PC"** with no generation listed (Scam alert!)\n- **GT 710/730/1030** (E-waste, cannot game)\n- **Single Stick RAM** (Slows PC down by 30%)\n\n**Approved Brands:** Maingear, Starforge, Corsair.\n**Avoid:** Random Amazon listings, older Dell OptiPlex "gaming" conversions.`,
      suggestions: [
        "Is Starforge good?",
        "Is CyberPowerPC good?",
        "Build vs Prebuilt",
      ],
    };
  }

  // Laptop Guide
  if (/(laptop|notebook).*(recommend|best|vs|desktop)/i.test(lower)) {
    const info = LAPTOP_KNOWLEDGE.tgpExplained;
    return {
      text: `**💻 Laptop Buying Guide:**\n\n**⚠️ THE TRAP:** Not all GPUs are equal! An "RTX 4060" laptop can limit power to 45W (slow) or 140W (fast). **Always check the TGP/Wattage!**\n\n**Screen Tips:** Aim for **16:10 aspect ratio** (taller screen) and **400+ nits** brightness.\n\n**Top Picks:** ASUS Zephyrus G14 (Portable), Lenovo Legion 5 (Value).`,
      suggestions: [
        "Zephyrus G14 review",
        "Laptop GPU wattage explained",
        "Gaming laptop vs Desktop",
      ],
    };
  }

  // PC won't turn on
  if (
    /(pc|computer).*(won't|wont|doesn't|doesnt|not).*(turn on|start|boot|power)/i.test(
      lower,
    ) ||
    /(won't|wont|not).*(turn on|start|boot)/i.test(lower)
  ) {
    return {
      text: `**PC Won't Turn On? Try these steps:** ⚡\n\n1. **Check power cable** – Is it plugged in? Try different outlet\n2. **Check PSU switch** – Flip the switch on the back\n3. **Check front panel connectors** – Power button cable might be loose\n4. **RAM reseat** – Remove and reinstall RAM sticks\n5. **CMOS reset** – Remove motherboard battery for 30 seconds\n\nIf still nothing, it might be a dead PSU or motherboard.`,
      suggestions: ["How to test PSU?", "Check motherboard", "Need new PSU?"],
    };
  }

  // === PERIPHERALS EXPLAINED ===

  // What is keyboard
  if (/what('s| is).*(a )?(keyboard|mechanical keyboard)/i.test(lower)) {
    return {
      text: `**Keyboard = Your command center!** ⌨️\n\n**Types:**\n- **Membrane:** Cheap, quiet, mushy feel\n- **Mechanical:** Clicky, precise, lasts longer\n- **Switches:** Red (smooth), Blue (clicky), Brown (tactile)\n\n**For gaming:** Mechanical with fast switches\n**For typing:** Mechanical with tactile feedback`,
      suggestions: [
        "Best gaming keyboard?",
        "Mechanical vs membrane?",
        "Cherry MX switches?",
      ],
    };
  }

  // What is mouse
  if (/what('s| is).*(a )?(mouse|gaming mouse)/i.test(lower)) {
    return {
      text: `**Mouse = Navigate and aim precisely!** 🖱️\n\n**Key specs:**\n- **DPI:** Higher = more sensitive (800-1600 for gaming)\n- **Polling rate:** 1000Hz for fastest response\n- **Weight:** Lighter for FPS, heavier for control\n\n**Wireless is now just as good as wired!**`,
      suggestions: [
        "Best gaming mouse?",
        "Wireless vs wired?",
        "What DPI for gaming?",
      ],
    };
  }

  // What is monitor
  if (
    /what('s| is).*(a )?(monitor|display)/i.test(lower) &&
    !/best|good|recommend/i.test(lower)
  ) {
    return {
      text: `**Monitor = Your window to games and work!** 🖥️\n\n**Key specs:**\n- **Resolution:** 1080p, 1440p, 4K\n- **Refresh rate:** 60Hz basic, 144Hz gaming, 240Hz competitive\n- **Panel:** IPS (colors), VA (contrast), TN (speed)\n\n**For gaming:** 1440p 144Hz IPS is the sweet spot!`,
      suggestions: [
        "Best gaming monitor?",
        "1080p vs 1440p?",
        "What refresh rate need?",
      ],
    };
  }

  // === BUILD PRIORITY PATTERNS ===

  // New to PC building
  if (
    /(new to|first time|beginner|never built|where.*start)/i.test(lower) &&
    /(pc|build|computer)/i.test(lower)
  ) {
    return {
      text: `**Welcome, future PC builder!** 🎉\n\nStart with these two questions:\n1. **What games/apps** will you use?\n2. **What's your budget?**\n\nOnce I know that, I'll suggest the perfect parts!\n\n**Tip:** Building a PC is easier than it looks – it's like adult LEGO!`,
      suggestions: [
        "Gaming build $1000",
        "Work PC $800",
        "I have no idea, help!",
      ],
    };
  }

  // Upgrade priority question
  if (
    /(what|which).*(upgrade|improve).*(first|priority|most)/i.test(lower) ||
    /biggest.*(upgrade|boost|improvement)/i.test(lower)
  ) {
    return {
      text: `**Best Upgrade Priority:** 🚀\n\n**For Gaming:**\n1. 🎮 **GPU** - Biggest FPS boost\n2. 💾 **SSD** - Faster loading\n3. 🧠 **CPU** - If bottlenecking GPU\n\n**For Productivity:**\n1. 🧠 **CPU** - More cores = faster rendering\n2. 🧠 **RAM** - 32GB+ for video editing\n3. 💾 **Storage** - NVMe for fast file access`,
      suggestions: ["Upgrade my GPU", "Upgrade my CPU", "Check bottleneck"],
    };
  }

  // Gaming build priorities
  if (
    /gaming.*(priority|important|order|matter)/i.test(lower) ||
    /(priority|order|important).*(gaming|game)/i.test(lower)
  ) {
    return {
      text: `**Gaming PC Priority Order:** 🎮\n\n1. **GPU** - Most important for FPS! (40-50% of budget)\n2. **CPU** - Needs to keep up with GPU\n3. **RAM** - 16-32GB DDR5\n4. **Storage** - NVMe SSD for fast loading\n5. **PSU** - Don't cheap out, protects your parts!`,
      suggestions: [
        "$1500 gaming build",
        "Best GPU for gaming",
        "Best CPU for gaming",
      ],
    };
  }

  // Workstation/work build priorities
  if (
    /(work|productivity|editing|render).*(priority|important|order)/i.test(
      lower,
    ) ||
    /(priority|order).*(work|productivity)/i.test(lower)
  ) {
    return {
      text: `**Workstation PC Priority Order:** 💼\n\n1. **CPU** - More cores for rendering (Ryzen 9 or i9)\n2. **RAM** - 32-64GB for video editing\n3. **Storage** - Fast NVMe + large HDD for files\n4. **GPU** - Important for video editing, less for coding\n5. **Cooling** - Heavy workloads = more heat!`,
      suggestions: [
        "$2000 workstation",
        "Best CPU for editing",
        "How much RAM for video?",
      ],
    };
  }

  // === PC BUILDING TIPS ===

  // How to build a PC / building tips
  if (
    /(how|tips).*(build|assemble).*(pc|computer)/i.test(lower) ||
    /pc building tips/i.test(lower)
  ) {
    return {
      text: `**PC Building Tips:** 🔧\n\n1. **Ground yourself** – Touch metal case to avoid static shock\n2. **Handle CPU by edges** – Never touch the pins or contacts\n3. **Install CPU cooler before mounting motherboard** – Easier access\n4. **Cable management** – Neater = better airflow\n5. **Test before closing** – Boot it up before putting panels on!\n\n**Most important:** Take your time, don't force anything!`,
      suggestions: ["Show build guide", "What tools need?", "Common mistakes?"],
    };
  }

  // Gaming PC optimization
  if (
    /(optimize|improve|boost).*(gaming|fps|performance)/i.test(lower) ||
    /gaming.*(optimize|tips|tricks)/i.test(lower)
  ) {
    return {
      text: `**Gaming PC Optimizations:** 🎮\n\n1. **Update GPU drivers** – NVIDIA GeForce or AMD Adrenalin\n2. **Close background apps** – Chrome, Discord eat resources\n3. **Game Mode** – Enable in Windows Settings\n4. **High Performance power plan** – Settings > Power\n5. **Consider overclocking** – Free performance (if cooled well!)\n\n**Enable DLSS/FSR** in games for massive FPS boost with minimal quality loss!`,
      suggestions: [
        "How to overclock?",
        "What is DLSS?",
        "Best settings for FPS",
      ],
    };
  }

  // Workstation optimization
  if (
    /(optimize|improve|boost).*(work|productivity|editing)/i.test(lower) ||
    /workstation.*(optimize|tips)/i.test(lower)
  ) {
    return {
      text: `**Workstation Optimizations:** 💼\n\n1. **Add more RAM** – 32GB+ for video editing, 3D work\n2. **Upgrade to NVMe SSD** – Faster loading and exports\n3. **Dual monitors** – Massive productivity boost!\n4. **Disable startup apps** – Faster boot times\n5. **Schedule tasks** – Render overnight\n\n**Pro tip:** Keep 20% storage free for optimal SSD performance!`,
      suggestions: [
        "Best RAM for editing?",
        "Dual monitor setup",
        "Best workstation build",
      ],
    };
  }

  // 1. GREETING - Multiple variations for natural feel (no self-intro since user knows the name)
  if (intents.isGreeting && !intents.budget) {
    const greetings = [
      {
        text: "Hey! 👋 What kind of PC are we building today?",
        suggestions: ["Gaming PC", "Workstation", "Just browsing"],
      },
      {
        text: "What's up! 😎 Ready to build something awesome? Tell me what you're looking for.",
        suggestions: [
          "$1500 gaming build",
          "Best GPU right now?",
          "Help me choose",
        ],
      },
      {
        text: "Hey there! Need help with a PC build or have questions about parts? I got you.",
        suggestions: [
          "Build me a PC",
          "Compare GPUs",
          "Budget recommendations",
        ],
      },
      {
        text: "Yo! 🖥️ Looking to build a PC? Just tell me your budget and what you'll use it for.",
        suggestions: [
          "Gaming for $1000",
          "Editing workstation",
          "Cheap streaming setup",
        ],
      },
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // 2. UPGRADE QUESTIONS - Check BEFORE budget to avoid treating model numbers as budgets
  // This catches "upgrade my Quadro M4000" before it extracts "4000" as budget
  // Jump to section 8 below which handles upgrade logic
  if (
    intents.askedUpgrade ||
    /(upgrade|improve|replace|swap).*(gpu|graphics|cpu|processor|card|old)/i.test(
      lower,
    ) ||
    /(gpu|graphics|cpu|processor|card).*(upgrade|improve|replace|swap)/i.test(
      lower,
    )
  ) {
    // Will be handled by upgrade section below - don't return here, let it fall through
    // But skip the budget check!
  }
  // 3. BUILD REQUEST (Budget detected) - Only if NOT asking for upgrade
  else if (intents.budget && !intents.askedUpgrade) {
    let type = "gaming"; // Default
    if (intents.isWork) type = "work";
    if (intents.isStreaming) type = "streaming";

    const build = generateBuildTable(type, intents.budget, intents.wantsOC);

    const title =
      type === "work"
        ? "Workstation Build"
        : type === "streaming"
          ? "Streaming Build"
          : "Gaming Build";

    // Format upsell suggestions
    const upsellText = formatUpsells(build.upsells);
    const budgetSummary = formatBudgetSummaryLine(intents.budget, build.total);

    return {
      text: `## Recommended Build — ${formatPrice(intents.budget)}\n\n**Type:** ${title}\n**Total:** ${formatPrice(build.total)}\n${budgetSummary}\n\n${build.table}\n\n### Compatibility\n${build.compatNotes}\n\n### Recommendation Notes\n${build.reasoning}${upsellText}${build.proTip || ""}`,
      suggestions: ["Increase budget", "Compare upgrades", "Change use case"],
      recommendations: build.recommendations,
      upsells: build.upsells,
    };
  }

  // === DIALOGUE PATTERNS (Training Data) ===

  // Dialogue 1: "What components do I need for a gaming PC?"
  if (
    /(what|which).*(component|part|need).*(gaming|pc|build)/i.test(lower) ||
    /components.*need/i.test(lower)
  ) {
    return {
      text: `CPU, motherboard, GPU, RAM, storage, power supply, and a case. What's your budget?`,
      suggestions: ["$800 build", "$1200 build", "$1500 build"],
    };
  }

  // Dialogue 2: "Should I choose AMD or Intel for video editing?"
  if (
    /(amd|intel).*(video edit|editing|render|productivity)/i.test(lower) ||
    /(video edit|editing|render).*(amd|intel)/i.test(lower)
  ) {
    return {
      text: `AMD Ryzen for multi-core performance or Intel Core i9 for high clock speeds. Which software do you use?`,
      suggestions: ["Premiere Pro", "DaVinci Resolve", "After Effects"],
    };
  }

  // Dialogue 3: "My CPU doesn't fit my motherboard"
  if (
    /(cpu|processor).*(doesn't|doesnt|won't|wont|not).*(fit|work|compatible)/i.test(
      lower,
    ) ||
    /(doesn't|doesnt|not).*(fit|work).*(motherboard|mobo)/i.test(lower)
  ) {
    return {
      text: `Check socket type and chipset compatibility. Ensure CPU socket matches motherboard socket (e.g., AM5 for Ryzen 7000, LGA 1700 for Intel 12th-14th gen).`,
      suggestions: [
        "CPU socket guide",
        "Check my compatibility",
        "Show compatible CPUs",
      ],
    };
  }

  // Dialogue 5: "How much RAM can my motherboard handle?"
  if (
    /(how much|max|maximum).*(ram|memory).*(motherboard|support|handle)/i.test(
      lower,
    )
  ) {
    return {
      text: `Check your motherboard manual or specs sheet for max RAM capacity and speed. Typically 64-128GB DDR4 or DDR5 for modern boards.`,
      suggestions: ["RAM recommendations", "DDR4 vs DDR5?", "Best RAM speed?"],
    };
  }

  // Dialogue 6: "Should I choose HDD or SSD?"
  if (
    /(hdd|ssd|hard drive).*(or|vs|versus)/i.test(lower) ||
    /(choose|pick).*(hdd|ssd|storage)/i.test(lower)
  ) {
    return {
      text: `SSD for faster loading times and responsiveness. HDD for larger storage capacity at lower cost. Consider both for balance - SSD for OS/games, HDD for files.`,
      suggestions: [
        "Best SSD for gaming",
        "How much storage?",
        "NVMe vs SATA?",
      ],
    };
  }

  // === COMPONENT DEEP-DIVES ===

  // Deep-dive: NVMe vs SATA SSD
  if (
    /nvme.*sata|sata.*nvme|difference.*(nvme|sata)|nvme.*worth/i.test(lower)
  ) {
    return {
      text: `## 💾 NVMe vs SATA SSD\n\n**NVMe SSD:**\n- ⚡ **Speed:** 3,500-7,000 MB/s\n- 💰 **Price:** ~$60-100 for 1TB\n- ✅ Plugs into M.2 slot on motherboard\n- ✅ Worth it for boot drive and games!\n\n**SATA SSD:**\n- ⚡ **Speed:** 500-550 MB/s (6x slower)\n- 💰 **Price:** ~$50-80 for 1TB\n- ⚠️ Uses cables like HDD\n\n**Verdict:** Get NVMe! The price difference is tiny and loading times are noticeably faster.`,
      suggestions: [
        "Best NVMe for gaming",
        "How much storage need?",
        "Gen 4 vs Gen 5?",
      ],
    };
  }

  // Deep-dive: DDR4 vs DDR5 RAM
  if (
    /ddr4.*ddr5|ddr5.*ddr4|difference.*(ddr4|ddr5)|ddr5.*worth/i.test(lower)
  ) {
    return {
      text: `## 🧠 DDR4 vs DDR5 RAM\n\n**DDR4:**\n- 💰 **Price:** ~$45-60 for 32GB\n- ⚡ **Speed:** 3200-3600 MHz typical\n- ✅ Works with older platforms (AM4, LGA 1200)\n- ✅ Great value, proven reliability\n\n**DDR5:**\n- 💰 **Price:** ~$80-120 for 32GB\n- ⚡ **Speed:** 5600-6400 MHz typical\n- ✅ Required for new platforms (AM5, LGA 1700)\n- ✅ Better for productivity, slight gaming boost\n\n**Verdict:** If building new, go DDR5 (AM5/Intel 13th+). Upgrading old PC? DDR4 is fine!`,
      suggestions: ["Best DDR5 speed", "How much RAM need?", "16GB vs 32GB?"],
    };
  }

  // Deep-dive: How much RAM
  if (
    /(how much|enough).*(ram|memory)/i.test(lower) ||
    /16.*32.*ram|32gb.*overkill/i.test(lower)
  ) {
    return {
      text: `## 🧠 How Much RAM Do You Need?\n\n**16GB:** ✅ Good for gaming\n- Handles most games fine\n- May struggle with Chrome + game + Discord\n\n**32GB:** ✅ Ideal for most users\n- Gaming + multitasking\n- Streaming + gaming\n- Video editing\n\n**64GB+:** For professionals\n- Heavy video editing (4K+)\n- 3D rendering\n- Running VMs\n\n**My recommendation:** 32GB DDR5 is the sweet spot in 2024!`,
      suggestions: [
        "Best RAM for gaming",
        "DDR4 vs DDR5?",
        "RAM speed matter?",
      ],
    };
  }

  // Deep-dive: CPU Cooler
  if (
    /(cpu|processor).*(cooler|cooling|fan)/i.test(lower) ||
    /(cooler|cooling).*(need|recommend|best)/i.test(lower) ||
    /what cooler/i.test(lower)
  ) {
    const cpu = context.currentBuild?.parts?.cpu;
    const cpuName = cpu?.name || cpu?.title || "";

    let recommendation = "";
    if (/7800x3d|7600|5600/i.test(cpuName)) {
      recommendation = `\n\n**For your ${cpuName}:** A mid-range tower cooler like **Thermalright Peerless Assassin** (~$35) or **AK620** (~$55) is perfect!`;
    } else if (/14600k|13600k|14700k|14900k/i.test(cpuName)) {
      recommendation = `\n\n**For your ${cpuName}:** You need serious cooling! Recommend **AIO 240mm+** or **Noctua NH-D15** for those Intel temps.`;
    }

    return {
      text: `## ❄️ CPU Cooler Guide\n\n**By CPU Power (TDP):**\n\n| CPU Type | TDP | Recommended Cooler | Price |\n|----------|-----|-------------------|-------|\n| Ryzen 5 7600 | 65W | Stock or Hyper 212 | $0-35 |\n| i5-14600K | 125W | AK620 / AIO 240mm | $55-100 |\n| Ryzen 7 7800X3D | 120W | Peerless Assassin | $35-55 |\n| i7/i9 14th Gen | 253W | AIO 360mm | $100-150 |${recommendation}`,
      suggestions: [
        "Best budget cooler",
        "AIO vs air cooling?",
        "Best AIO 240mm",
      ],
    };
  }

  // Dialogue 7: "What wattage power supply do I need?"
  if (
    /(what|how much).*(watt|psu|power supply)/i.test(lower) ||
    /wattage.*(need|require)/i.test(lower)
  ) {
    const gpu = context.currentBuild?.parts?.gpu;
    const gpuName = gpu?.name || gpu?.title || "";

    let response = `Calculate total system power: CPU + GPU + components. Add 100W headroom for safety.\n\n`;
    response += `**Typical ranges:**\n- Budget builds: 450-550W\n- Mid-range: 550-650W\n- High-end: 650-850W\n- RTX 4090: 850W+`;

    if (gpuName) {
      response =
        `For your **${gpuName}**, I recommend at least 650W Gold-rated PSU.\n\n` +
        response;
    }

    return {
      text: response,
      suggestions: [
        "Best PSU brands",
        "Check my build power",
        "80+ ratings explained",
      ],
    };
  }

  // Dialogue 8: "How to choose a PC case?"
  if (
    /(how|what).*(choose|pick|select).*(case|chassis)/i.test(lower) ||
    /pc case.*(recommend|good|best)/i.test(lower)
  ) {
    return {
      text: `Consider: **Size** (ATX, microATX, miniITX), **Airflow** (mesh front panels), **Cooling** (fan mounts, radiator support), and **Cable management** features.\n\nPopular picks: Lian Li Lancool II Mesh, Fractal North, NZXT H5 Flow.`,
      suggestions: ["Best airflow cases", "Small form factor", "RGB cases"],
    };
  }

  // Dialogue 9: "My PC won't boot"
  if (
    /(pc|computer|system).*(won't|wont|not|doesn't|doesnt).*(boot|start|turn on|post)/i.test(
      lower,
    ) ||
    /won't boot|no post|black screen/i.test(lower)
  ) {
    return {
      text: `Troubleshooting steps:\n1. Check power supply connections (24-pin, CPU 8-pin)\n2. Reseat RAM in correct slots\n3. Verify CPU installation and cooler mounting\n4. Check front panel connectors\n5. Try booting with one RAM stick\n\nDo you see any lights or hear fans?`,
      suggestions: [
        "No lights at all",
        "Fans spin then stop",
        "Lights but no display",
      ],
    };
  }

  // Dialogue 10: "Do I need to update my BIOS?"
  if (
    /(need|should).*(update|upgrade).*(bios|uefi)/i.test(lower) ||
    /bios update/i.test(lower)
  ) {
    return {
      text: `Update BIOS for: new CPU compatibility, stability fixes, or security patches. Download from motherboard manufacturer website and follow instructions carefully.\n\n⚠️ Don't update during power outages - it can brick your board!`,
      suggestions: [
        "How to update BIOS",
        "Is my BIOS current?",
        "BIOS update risks",
      ],
    };
  }

  // Dialogue 11: "Will this build run Roblox and Fortnite?"
  if (
    /(run|play|handle).*(roblox|fortnite)/i.test(lower) ||
    /(roblox|fortnite).*(run|play|work|fps)/i.test(lower)
  ) {
    const gpu = context.currentBuild?.parts?.gpu;
    const gpuName = gpu?.name || gpu?.title || "";

    // Check if they have a budget GPU
    if (/6650|6600|4060|7600|3060/i.test(gpuName) || !gpuName) {
      return {
        text: `Yes, this build will run Roblox and Fortnite at high settings!\n\n*(FPS means frames per second – how smoothly games run!)*\n\n**Expected Performance at 1080p:**\n- 🎮 **Roblox:** 60+ FPS (very smooth)\n- 🎮 **Fortnite:** 80+ FPS on High settings\n\nBoth games are well-optimized and run great on budget hardware!`,
        suggestions: [
          "Build for Roblox/Fortnite",
          "What about Minecraft?",
          "Can I stream too?",
        ],
      };
    } else {
      return {
        text: `Absolutely! With your **${gpuName}**, you'll crush Roblox and Fortnite!\n\n**Expected Performance:**\n- 🎮 **Roblox:** 120+ FPS (maxed out)\n- 🎮 **Fortnite:** 144+ FPS at High/Epic settings\n\nYou could even play at 1440p with great framerates!`,
        suggestions: [
          "What about competitive settings?",
          "Can I stream while playing?",
          "Other games I can run?",
        ],
      };
    }
  }

  // Dialogue 12: "Will this run Minecraft?"
  if (
    /(run|play|handle).*(minecraft)/i.test(lower) ||
    /(minecraft).*(run|play|fps|shader)/i.test(lower)
  ) {
    const gpu = context.currentBuild?.parts?.gpu;
    const gpuName = gpu?.name || gpu?.title || "";

    const hasShaders = /shader|rtx|ray/i.test(lower);

    if (hasShaders) {
      return {
        text: `**Minecraft with Shaders/RTX:**\n\n*(FPS = frames per second – how smooth it runs)*\n\n**Expected Performance at 1080p:**\n- 🎮 **With Shaders:** 60-90 FPS (looks amazing!)\n- 🎮 **RTX (if NVIDIA):** 40-60 FPS with DLSS\n\nShaders are demanding! For smooth 60+ FPS with shaders, I recommend at least an RTX 4060 or RX 7600.`,
        suggestions: [
          "Best GPU for shaders",
          "Minecraft without shaders?",
          "Show shader comparison",
        ],
      };
    }

    return {
      text: `Yes! Minecraft runs great on almost any PC!\n\n*(FPS = frames per second – how smooth it runs)*\n\n**Expected Performance at 1080p:**\n- 🎮 **Vanilla Minecraft:** 200+ FPS\n- 🎮 **With Mods:** 60-120 FPS\n- 🎮 **With Shaders:** 40-90 FPS (GPU dependent)\n\nMinecraft is CPU-heavy, so a good processor helps with chunk loading!`,
      suggestions: [
        "Best CPU for Minecraft",
        "Minecraft with shaders?",
        "Modded Minecraft build",
      ],
    };
  }

  // Dialogue 13: "Will this run Valorant?"
  if (
    /(run|play|handle).*(valorant)/i.test(lower) ||
    /(valorant).*(run|play|fps|competitive)/i.test(lower)
  ) {
    const gpu = context.currentBuild?.parts?.gpu;
    const gpuName = gpu?.name || gpu?.title || "";

    return {
      text: `Valorant runs incredibly well on most PCs!\n\n*(FPS = frames per second – higher is better for competitive!)*\n\n**Expected Performance at 1080p Low:**\n- 🎮 **Budget GPU:** 200+ FPS\n- 🎮 **Mid-range GPU:** 300+ FPS\n- 🎮 **High-end GPU:** 400+ FPS\n\n**Pro Tip:** For competitive, aim for a 144Hz or 240Hz monitor to take advantage of those high framerates!`,
      suggestions: [
        "Best monitor for Valorant",
        "Competitive gaming build",
        "Best CPU for high FPS",
      ],
    };
  }

  // Dialogue 14: "Will this run COD/Warzone?"
  if (
    /(run|play|handle).*(cod|call of duty|warzone|mw2|mw3)/i.test(lower) ||
    /(warzone|cod).*(run|play|fps)/i.test(lower)
  ) {
    const gpu = context.currentBuild?.parts?.gpu;
    const gpuName = gpu?.name || gpu?.title || "";

    if (/6650|6600|4060|7600|3060/i.test(gpuName) || !gpuName) {
      return {
        text: `COD/Warzone is demanding, but playable on budget hardware!\n\n*(FPS = frames per second – 60+ is smooth)*\n\n**Expected Performance at 1080p Medium:**\n- 🎮 **Warzone 2.0:** 60-80 FPS\n- 🎮 **MW3 Multiplayer:** 80-100 FPS\n\nFor 1440p or higher settings, consider upgrading to RTX 4070 or RX 7800 XT!`,
        suggestions: [
          "Upgrade GPU for Warzone",
          "Best settings for FPS",
          "Warzone build $1500",
        ],
      };
    } else {
      return {
        text: `Your GPU will handle COD/Warzone great!\n\n**Expected Performance:**\n- 🎮 **Warzone at 1080p High:** 100+ FPS\n- 🎮 **Warzone at 1440p:** 80+ FPS\n- 🎮 **MW3 Multiplayer:** 120+ FPS\n\nYou're ready for battle! Consider a 144Hz monitor for competitive play.`,
        suggestions: [
          "Best Warzone settings",
          "Can I stream Warzone?",
          "Monitor recommendations",
        ],
      };
    }
  }

  // === STREAMING BUILD PATTERNS ===

  // Dialogue 15: "Can I stream with this build?"
  if (
    /(can i|will this|able to).*(stream|twitch|obs|broadcast)/i.test(lower) ||
    /(stream|twitch).*(this build|my build|work)/i.test(lower)
  ) {
    const gpu = context.currentBuild?.parts?.gpu;
    const cpu = context.currentBuild?.parts?.cpu;
    const gpuName = gpu?.name || gpu?.title || "";
    const cpuName = cpu?.name || cpu?.title || "";

    const hasNvidia = /nvidia|rtx|gtx|geforce/i.test(gpuName);
    const hasGoodCpu = /7800|7600|14600|13600|5800|5600/i.test(cpuName);

    if (hasNvidia) {
      return {
        text: `Yes! NVIDIA GPUs have **NVENC encoder** which is perfect for streaming!\n\n**Your streaming setup:**\n- 🎬 Use **NVENC (new)** in OBS for minimal performance impact\n- 📺 Stream at 1080p 60fps easily\n- 🎮 Game + Stream with almost no FPS loss!\n\n**Pro Tip:** NVENC handles encoding so your CPU stays free for gaming.`,
        suggestions: [
          "Best OBS settings",
          "How to set up Twitch",
          "Stream and record?",
        ],
      };
    } else {
      return {
        text: `You can stream, but with some considerations:\n\n**For AMD GPUs:**\n- 🎬 Use **AMF encoder** in OBS (decent quality)\n- 📺 Or use **x264** with a good CPU (better quality, more CPU usage)\n\n**Recommended for best streaming:**\n- 6+ core CPU (Ryzen 5 7600 or better)\n- Or upgrade to NVIDIA RTX for NVENC\n\nWhat games will you be streaming?`,
        suggestions: [
          "Streaming with AMD",
          "Should I get NVIDIA?",
          "Best streaming CPU",
        ],
      };
    }
  }

  // Dialogue 16: "Streaming PC build" / "Build for Twitch"
  if (
    /(stream|twitch|content creator|youtube).*(build|pc|setup)/i.test(lower) ||
    /(build|pc|setup).*(stream|twitch|creator)/i.test(lower)
  ) {
    return {
      text: `## 🎬 Streaming/Content Creator Build\n\n**Essential for streaming:**\n- **CPU:** 6+ cores (Ryzen 5 7600 or i5-14600K)\n- **GPU:** NVIDIA RTX (NVENC encoder is a game-changer!)\n- **RAM:** 32GB DDR5 (for multitasking)\n- **Storage:** 2TB+ NVMe (recordings eat space!)\n\n**Budget picks:**\n- **$1200:** Ryzen 5 7600 + RTX 4060 Ti\n- **$1800:** Ryzen 7 7800X3D + RTX 4070 Super\n\nWhat's your budget for streaming?`,
      suggestions: [
        "$1200 streaming build",
        "$1800 streaming build",
        "Dual PC setup?",
      ],
    };
  }

  // Dialogue 17: "What is NVENC?" / "NVENC vs x264"
  if (/nvenc|encoder|x264/i.test(lower)) {
    return {
      text: `## 🎬 Streaming Encoders Explained\n\n**NVENC (NVIDIA):**\n- ✅ Uses GPU, not CPU\n- ✅ Minimal FPS impact while streaming\n- ✅ Great quality at high bitrates\n- ❌ Only on NVIDIA GPUs\n\n**x264 (CPU):**\n- ✅ Best quality at lower bitrates\n- ✅ Works on any PC\n- ❌ Uses 20-30% CPU (hurts gaming)\n\n**Recommendation:** NVENC for gaming + streaming, x264 for dedicated streaming PCs.`,
      suggestions: ["Best GPU for NVENC", "Dual PC streaming", "OBS settings"],
    };
  }

  // === NEW REPLY PATTERNS ===

  // PATTERN 0: BUILD-AWARE - "What's a better GPU than this/my?"
  // Uses the user's current build to suggest upgrades
  const betterThanThisPattern =
    /(better|upgrade|improve).*(than this|than my|my current|this one|i have)/i;
  const componentInQuestion = /(cpu|gpu|processor|graphics|ram|memory)/i.test(
    lower,
  );

  if (betterThanThisPattern.test(lower) && componentInQuestion) {
    const isCpu = /cpu|processor/i.test(lower);
    const isGpu = /gpu|graphics/i.test(lower);

    if (isCpu) {
      const cpu = context.currentBuild?.parts?.cpu;
      const cpuName = cpu?.name || cpu?.title;

      if (cpuName) {
        const betterCpu = getBetterComponent("cpu", cpu);
        if (betterCpu) {
          return {
            text: `A better CPU option is **${partLink(betterCpu.name)}** (~$${betterCpu.price}). It has ${betterCpu.advantage}.\n\nWould you like me to add it to your build?`,
            suggestions: [
              "Add to build",
              "Compare options",
              "Show alternatives",
            ],
          };
        }
      } else {
        return {
          text: `I don't see a CPU in your build yet. Add one first, or tell me your budget and I'll recommend one!\n\nFor example: "Best CPU for $300"`,
          suggestions: [
            "Best CPU for $300",
            "Show my build",
            "Budget CPU options",
          ],
        };
      }
    }

    if (isGpu) {
      const gpu = context.currentBuild?.parts?.gpu;
      const gpuName = gpu?.name || gpu?.title;

      if (gpuName) {
        const betterGpu = getBetterComponent("gpu", gpu);
        if (betterGpu) {
          // Check if NVIDIA, suggest AMD alternative too
          const isNvidia = /nvidia|rtx|gtx|geforce/i.test(gpuName);
          const altText = isNvidia
            ? `\n\nWould you like me to compare ${betterGpu.name} to AMD options like RX 7800 XT?`
            : `\n\nWould you like me to compare ${betterGpu.name} to NVIDIA options like RTX 4070 Super?`;

          return {
            text: `A better GPU option is **${partLink(betterGpu.name)}** (~$${betterGpu.price}). It has ${betterGpu.advantage}.${altText}`,
            suggestions: [
              "Add to build",
              "Compare to AMD",
              "Compare to NVIDIA",
            ],
          };
        }
      } else {
        return {
          text: `I don't see a GPU in your build yet. Add one first, or tell me your budget and I'll recommend one!\n\nFor example: "Best GPU for $500"`,
          suggestions: [
            "Best GPU for $500",
            "Show my build",
            "Budget GPU options",
          ],
        };
      }
    }
  }

  // PATTERN 0b: "Suggest upgrades" with budget and current build
  const upgradeWithBudgetPattern =
    /(upgrade|improve|better).*(budget|spend|\$)\s*(\d{3,5})/i;
  const budgetUpgradeMatch = message.match(upgradeWithBudgetPattern);

  if (budgetUpgradeMatch && context.currentBuild?.parts) {
    const upgradeBudget = parseInt(budgetUpgradeMatch[3]);
    const recommendations = suggestBetterCpuGpu(
      upgradeBudget,
      context.currentBuild,
    );

    if (recommendations.cpu || recommendations.gpu) {
      let response = `With your budget of **$${upgradeBudget}** and current build specs, I recommend:\n\n`;

      if (recommendations.cpu) {
        const currentCpu =
          context.currentBuild.parts.cpu?.name || "your current CPU";
        response += `**CPU:** ${partLink(recommendations.cpu.name)} (~$${recommendations.cpu.price}) - ${recommendations.cpu.advantage}\n\n`;
      }

      if (recommendations.gpu) {
        const currentGpu =
          context.currentBuild.parts.gpu?.name || "your current GPU";
        response += `**GPU:** ${partLink(recommendations.gpu.name)} (~$${recommendations.gpu.price}) - ${recommendations.gpu.advantage}\n\n`;
      }

      response += `Would you like me to add them to your build?`;

      return {
        text: response,
        suggestions: ["Add CPU", "Add GPU", "Add both", "Compare options"],
      };
    }
  }

  // PATTERN 1: DIRECT ANSWER - "Better CPU/GPU for $X?"
  const betterForPricePattern =
    /(better|best|good).*(cpu|gpu|processor|graphics).*(for|under|around)?\s*\$?(\d{2,4})/i;
  const priceMatch = message.match(betterForPricePattern);
  if (priceMatch) {
    const isCpu = /cpu|processor/i.test(priceMatch[0]);
    const price = parseInt(priceMatch[4]);

    if (isCpu) {
      if (price < 150) {
        return {
          text: `**${partLink("Intel i3-12100F")}** is a great option for ~$${price}. It has 4 fast cores with excellent single-thread performance for gaming.\n\nWould you like me to add it to your build?`,
          suggestions: [
            "Add to build",
            "Show alternatives",
            "What GPU pairs with it?",
          ],
        };
      } else if (price < 250) {
        return {
          text: `**${partLink("AMD Ryzen 5 7600")}** (~$199) is the best option for ~$${price}. It has 6 cores on the latest AM5 platform with great gaming and multitasking performance.\n\nWould you like me to add it to your build?`,
          suggestions: ["Add to build", "Compare to Intel", "Need more cores?"],
        };
      } else if (price < 400) {
        return {
          text: `**${partLink("Intel i5-14600K")}** (~$319) is the best bang-for-buck at ~$${price}. It has 14 cores (6P+8E) and is overclockable.\n\nWould you like me to add it to your build?`,
          suggestions: [
            "Add to build",
            "Compare to AMD",
            "What cooler for this?",
          ],
        };
      } else {
        return {
          text: `**${partLink("AMD Ryzen 7 7800X3D")}** (~$449) is the #1 gaming CPU for ~$${price}. Its 3D V-Cache gives 10-20% better gaming FPS than any competitor.\n\nWould you like me to add it to your build?`,
          suggestions: ["Add to build", "Compare to Intel", "Worth the price?"],
        };
      }
    } else {
      // GPU recommendations by price
      if (price < 250) {
        return {
          text: `**${partLink("RX 6650 XT")}** (~$189) is a great option for ~$${price}. It handles 1080p gaming with 8GB VRAM.\n\nWould you like me to add it to your build?`,
          suggestions: [
            "Add to build",
            "Show alternatives",
            "Compare to RTX 4060",
          ],
        };
      } else if (price < 450) {
        return {
          text: `**${partLink("RTX 4060 Ti")}** (~$399) is the sweet spot for ~$${price}. It has excellent 1080p Ultra performance with DLSS 3 support.\n\nWould you like me to add it to your build?`,
          suggestions: ["Add to build", "Compare to AMD", "Good for 1440p?"],
        };
      } else if (price < 700) {
        return {
          text: `**${partLink("RTX 4070 Super")}** (~$599) is excellent for ~$${price}. It delivers 100+ FPS at 1440p Ultra with ray tracing and DLSS 3.\n\nWould you like me to add it to your build?`,
          suggestions: [
            "Add to build",
            "Compare to RX 7800 XT",
            "Good for 4K?",
          ],
        };
      } else {
        return {
          text: `**${partLink("RTX 4080 Super")}** (~$999) dominates at ~$${price}. It delivers true 4K 60+ FPS with the best ray tracing and DLSS 3.\n\nWould you like me to add it to your build?`,
          suggestions: [
            "Add to build",
            "Compare to RX 7900 XTX",
            "Is 4090 worth it?",
          ],
        };
      }
    }
  }

  // PATTERN 2: OUT OF STOCK / ALTERNATIVES - "X is out of stock"
  const outOfStockPattern =
    /(out of stock|unavailable|can't find|alternative to|instead of|similar to)\s*(.*?)(\?|$)/i;
  const stockMatch = message.match(outOfStockPattern);
  if (stockMatch || /(what else|other options|alternatives)/i.test(lower)) {
    // Try to detect what part they're asking about
    if (/7800x3d/i.test(lower)) {
      return {
        text: `Try ${partLink("Intel i5-14600K")} or ${partLink("Ryzen 5 7600X")}, similar gaming performance at lower price.\n\nWould you like me to compare them or add one to your build?`,
        suggestions: ["Compare them", "Add i5-14600K", "Add Ryzen 5 7600X"],
      };
    }
    if (/4070|7800\s*xt/i.test(lower)) {
      return {
        text: `Try ${partLink("RTX 4070 Super")} or ${partLink("RX 7800 XT")}, both great for 1440p gaming at similar price.\n\nWould you like me to compare them or add one to your build?`,
        suggestions: ["Compare them", "Add RTX 4070 Super", "Add RX 7800 XT"],
      };
    }
    // Generic response
    return {
      text: `## Finding Alternatives\n\nTell me which specific part you're looking for alternatives to, and I'll suggest similar options!\n\nFor example:\n- "Alternative to RTX 4070"\n- "Similar to Ryzen 5 7600"\n- "What else is like the NH-D15?"`,
      suggestions: [
        "GPU alternatives",
        "CPU alternatives",
        "Best value options",
      ],
    };
  }

  // PATTERN 3: WHY QUESTIONS - "Why X over Y?"
  const whyPattern =
    /(why|reason|what makes).*(better|over|instead|choose|pick|prefer)/i;
  if (whyPattern.test(lower)) {
    if (
      /(amd|ryzen).*(intel)/i.test(lower) ||
      /(intel).*(amd|ryzen)/i.test(lower)
    ) {
      return {
        text: `**AMD Ryzen** is better for pure gaming (7800X3D has 3D V-Cache), while **Intel** has more cores for productivity.\n\nFor your needs, I recommend AMD for gaming, Intel for work. Do you have other questions about this?`,
        suggestions: [
          "Gaming build with AMD",
          "Workstation with Intel",
          "Budget option?",
        ],
      };
    }
    if (
      /(nvidia|rtx).*(amd|rx)/i.test(lower) ||
      /(amd|rx).*(nvidia|rtx)/i.test(lower)
    ) {
      return {
        text: `**NVIDIA** is better for ray tracing and DLSS 3 (AI frame generation), while **AMD** offers more raw performance per dollar.\n\nFor streaming, NVIDIA wins with NVENC encoder. Do you have other questions about this?`,
        suggestions: ["NVIDIA build", "AMD build", "Compare specific cards"],
      };
    }
    // Generic why response
    return {
      text: `## Making the Right Choice\n\nI can explain why one part is better than another! Just ask:\n\n- "Why Ryzen over Intel?"\n- "Why RTX 4070 over RX 7800 XT?"\n- "Why DDR5 over DDR4?"\n\nWhat are you deciding between?`,
      suggestions: ["CPU comparison", "GPU comparison", "Help me choose"],
    };
  }

  // PATTERN 4: VAGUE "BEST" QUESTIONS - Need clarification
  const vagueBestPattern =
    /^(what('s| is)?\s*the\s*)?(best|good)\s*(cpu|gpu|processor|graphics|ram|ssd|motherboard|psu)(\?)?$/i;
  if (vagueBestPattern.test(lower.trim())) {
    const part =
      lower.match(
        /(cpu|gpu|processor|graphics|ram|ssd|motherboard|psu)/i,
      )?.[0] || "part";
    return {
      text: `For gaming or video editing? And what's your budget?\n\nJust say something like "$300 gaming ${part}" and I'll give you my top pick!`,
      suggestions: [
        `$300 gaming ${part}`,
        `Best ${part} for work`,
        `Budget ${part} options`,
      ],
    };
  }

  // 3. GPU QUESTIONS
  if (
    /(best|good|recommend).*(gpu|graphics|video card)/i.test(lower) ||
    /(gpu|graphics).*(recommend|good|best)/i.test(lower)
  ) {
    if (/4k/i.test(lower)) {
      return {
        text: "## Best GPUs for 4K Gaming\n\n| GPU | Price | 4K Performance |\n|-----|-------|----------------|\n| **RTX 4080 Super** | ~$999 | Excellent (80+ FPS) |\n| **RTX 4070 Ti Super** | ~$799 | Very Good (60-80 FPS) |\n| **RX 7900 XTX** | ~$899 | Excellent (80+ FPS) |\n\n**My recommendation:** The **RTX 4080 Super** offers the best 4K experience with DLSS 3 for extra frames.",
        suggestions: [
          "Build a 4K gaming PC",
          "RTX vs AMD GPU?",
          "What CPU pairs with 4080?",
        ],
      };
    }
    if (/1440|2k/i.test(lower)) {
      return {
        text: "## Best GPUs for 1440p Gaming\n\n| GPU | Price | 1440p Performance |\n|-----|-------|-------------------|\n| **RTX 4070 Super** | ~$599 | Excellent (100+ FPS) |\n| **RX 7800 XT** | ~$499 | Very Good (90+ FPS) |\n| **RTX 4060 Ti** | ~$399 | Good (70+ FPS) |\n\n**My recommendation:** The **RTX 4070 Super** is the sweet spot for 1440p.",
        suggestions: [
          "$1500 1440p build",
          "RTX 4070 vs RX 7800?",
          "Best CPU for 1440p?",
        ],
      };
    }
    return {
      text: "## GPU Recommendations by Budget\n\n| Budget | Best GPU | Target |\n|--------|----------|--------|\n| **$200** | RX 6650 XT | 1080p High |\n| **$400** | RTX 4060 Ti | 1080p Ultra |\n| **$600** | RTX 4070 Super | 1440p |\n| **$1000** | RTX 4080 Super | 4K |\n\nWhat resolution are you targeting?",
      suggestions: [
        "Best GPU for 1080p",
        "Best GPU for 4K",
        "Build me a gaming PC",
      ],
    };
  }

  // 4. CPU QUESTIONS
  if (
    /(best|good|recommend).*(cpu|processor)/i.test(lower) ||
    /(cpu|processor).*(recommend|good|best)/i.test(lower)
  ) {
    if (/gaming/i.test(lower)) {
      return {
        text: `For gaming, consider **${partLink("AMD Ryzen 5 7600")}** (~$199) or **${partLink("Intel i5-14600K")}** (~$319). Both handle popular games smoothly!\n\nFor the absolute best gaming performance, the **${partLink("AMD Ryzen 7 7800X3D")}** (~$449) is #1 thanks to its 3D V-Cache.\n\nWould you like a full build suggestion for your gaming PC?`,
        suggestions: [
          "Build me a $1500 gaming PC",
          "Tell me more about 7800X3D",
          "Budget gaming build",
        ],
      };
    }
    return {
      text: "## CPU Recommendations\n\n| Use Case | Best CPU | Price |\n|----------|----------|-------|\n| **Budget Gaming** | Ryzen 5 7600 | ~$199 |\n| **High-End Gaming** | Ryzen 7 7800X3D | ~$449 |\n| **Productivity** | Intel i7-14700K | ~$399 |\n| **Content Creation** | Ryzen 9 7950X | ~$549 |\n\nWhat's your primary use case?",
      suggestions: [
        "Gaming build $1500",
        "Workstation $2000",
        "Best budget CPU?",
      ],
    };
  }

  // 4b. GAME-SPECIFIC FPS QUESTIONS - "How well can I run Cyberpunk?"
  const gameQuestionPattern =
    /(how|what|can i).*(run|play|fps|performance).*(cyberpunk|fortnite|valorant|cs2|counter-strike|elden ring|hogwarts|starfield)/i;
  const gameNames = {
    cyberpunk: "cyberpunk 2077",
    fortnite: "fortnite",
    valorant: "valorant",
    cs2: "cs2",
    "counter-strike": "cs2",
    "elden ring": "elden ring",
    hogwarts: "hogwarts legacy",
    starfield: "starfield",
  };

  if (gameQuestionPattern.test(lower)) {
    // Find which game the user is asking about
    let matchedGame = null;
    for (const [key, value] of Object.entries(gameNames)) {
      if (lower.includes(key)) {
        matchedGame = value;
        break;
      }
    }

    if (matchedGame && GAME_FPS_DATA[matchedGame]) {
      const gameData = GAME_FPS_DATA[matchedGame];
      const gpu = context.currentBuild?.parts?.gpu;
      const gpuName = gpu?.name || gpu?.title;

      let response = `## 🎮 ${gameData.name} Performance\n\n`;

      // If user has a GPU, give specific advice
      if (gpuName) {
        const gpuLower = gpuName.toLowerCase();
        let userGpuKey = null;
        for (const key of Object.keys(gameData)) {
          if (
            key !== "name" &&
            key !== "notes" &&
            gpuLower.includes(key.replace("rtx ", "").replace("rx ", ""))
          ) {
            userGpuKey = key;
            break;
          }
        }

        if (userGpuKey && gameData[userGpuKey]) {
          const fpsData = gameData[userGpuKey];
          response += `With your **${gpuName}**:\n\n| Resolution | Expected FPS |\n|------------|-------------|\n`;
          if (fpsData["1080p"])
            response += `| 1080p | ~${fpsData["1080p"]} FPS |\n`;
          if (fpsData["1440p"])
            response += `| 1440p | ~${fpsData["1440p"]} FPS |\n`;
          if (fpsData["4k"]) response += `| 4K | ~${fpsData["4k"]} FPS |\n`;
        } else {
          response += `I don't have specific data for your **${gpuName}**, but here's a general guide:\n\n`;
        }
      } else {
        response += `Here's what you can expect with different GPUs:\n\n`;
      }

      // Add general GPU FPS table for this game
      if (!gpuName || !GAME_FPS_DATA[matchedGame][gpuName?.toLowerCase()]) {
        response += `| GPU | 1080p | 1440p | 4K |\n|-----|-------|-------|----|\n`;
        for (const [key, value] of Object.entries(gameData)) {
          if (key !== "name" && key !== "notes" && typeof value === "object") {
            response += `| ${key.toUpperCase()} | ${value["1080p"] || "-"} | ${value["1440p"] || "-"} | ${value["4k"] || "-"} |\n`;
          }
        }
      }

      if (gameData.notes) {
        response += `\n**Note:** ${gameData.notes}`;
      }

      return {
        text: response,
        suggestions: [
          `Best GPU for ${matchedGame}`,
          "Build for this game",
          "Check my build",
        ],
      };
    }
  }

  // 5. COMPARISON QUESTIONS
  if (
    /(vs|versus|compare|better|difference|or)/i.test(lower) &&
    /(nvidia|amd|intel|rtx|rx|ryzen|i5|i7|i9)/i.test(lower)
  ) {
    if (
      /(nvidia|rtx).*(amd|rx)/i.test(lower) ||
      /(amd|rx).*(nvidia|rtx)/i.test(lower)
    ) {
      return {
        text: "## NVIDIA vs AMD GPUs\n\n| Feature | NVIDIA (RTX) | AMD (RX) |\n|---------|--------------|----------|\n| **Ray Tracing** | ⭐ Superior | Good |\n| **Raw Performance** | Great | ⭐ Better value |\n| **DLSS/FSR** | DLSS 3 (better) | FSR 3 (good) |\n| **Power Efficiency** | ⭐ Better | Uses more power |\n| **Streaming (NVENC)** | ⭐ Excellent | Limited |\n\n**Bottom line:** NVIDIA for streaming/ray tracing, AMD for pure price-to-performance.",
        suggestions: [
          "RTX 4070 vs RX 7800?",
          "Best GPU for $500?",
          "Gaming PC $1500",
        ],
      };
    }
    if (
      /(intel).*(amd|ryzen)/i.test(lower) ||
      /(amd|ryzen).*(intel)/i.test(lower)
    ) {
      return {
        text: "## Intel vs AMD CPUs (2024)\n\n| Feature | Intel | AMD |\n|---------|-------|-----|\n| **Gaming** | Great | ⭐ 7800X3D is king |\n| **Productivity** | ⭐ More cores (i7/i9) | Very Good |\n| **Power Usage** | Uses more | ⭐ Efficient |\n| **Platform Cost** | Similar | Similar |\n\n**For gaming:** AMD Ryzen 7 7800X3D\n**For work:** Intel i7-14700K",
        suggestions: [
          "Ryzen 7800X3D build",
          "Intel workstation",
          "Gaming PC $2000",
        ],
      };
    }
    return {
      text: 'I can compare specific components for you! Try asking:\n\n• "RTX 4070 vs RX 7800 XT"\n• "Intel i5 vs Ryzen 5"\n• "DDR4 vs DDR5"\n\nWhich parts are you comparing?',
      suggestions: ["NVIDIA vs AMD", "Intel vs Ryzen", "Best GPU 2024"],
    };
  }

  // 6. BEGINNER / NEW TO PC
  if (
    /(new|beginner|first|dont know|don't know|start|learn|confused|help me)/i.test(
      lower,
    ) &&
    /(pc|computer|build)/i.test(lower)
  ) {
    return {
      text: "## Welcome to PC Building! 🎉\n\nDon't worry—I'll guide you through it step by step.\n\n**Quick Start:**\n1. **Set a budget** ($800-$2000 is common)\n2. **Pick your use case** (Gaming? Work? Both?)\n3. **I'll handle the rest** (compatibility, optimization)\n\n**Your first question:** What's your budget, and what will you mainly use this PC for?",
      suggestions: [
        "$1000 gaming PC",
        "$1500 all-purpose PC",
        "What do I need to know?",
      ],
    };
  }

  // 7. EXPLANATION REQUEST
  if (intents.needsExplanation) {
    return {
      text: "## Why Matching Matters\n\nBalancing a PC is about avoiding **bottlenecks**.\n\n• **CPU limit:** GPU sits idle waiting for instructions (Lag).\n• **GPU limit:** CPU sits idle waiting for frames (Low FPS).\n• **RAM:** Too slow clogs the CPU; too little crashes apps.\n\nI calculate these ratios to ensure every dollar goes to performance.",
      suggestions: [
        "Check my build logic",
        "What is a bottleneck?",
        "Best upgrade for me?",
      ],
    };
  }

  // 8. UPGRADE QUESTIONS - Enhanced to detect specific components
  // Also triggers if user just mentions an old GPU name (implies they want upgrade advice)
  // Also triggers if user is answering our previous question about their GPU/CPU
  const mentionsOldGpu =
    /(quadr[oa]|gtx\s*(9|7|6|5|10|16)\d{2}|rtx\s*(20|30)\d{2}|rx\s*(5|4|3)\d{2}|r9|firepro)/i.test(
      lower,
    );
  if (
    /(upgrade|improve|slow|faster|better|performance|replace|swap|old)/i.test(
      lower,
    ) ||
    mentionsOldGpu ||
    answeringType ||
    mem.wantsUpgrade ||
    isShortComponentMessage
  ) {
    // Detect if user mentions a specific old GPU
    const oldGpuPatterns = [
      // GTX 10xx/16xx Series
      {
        pattern: /(gtx\s*1060|1060)/i,
        name: "GTX 1060",
        upgrades: ["RX 6650 XT (~$189)", "RTX 4060 (~$299)", "RX 7600 (~$269)"],
      },
      {
        pattern: /(gtx\s*1070|1070)/i,
        name: "GTX 1070",
        upgrades: [
          "RTX 4060 Ti (~$399)",
          "RX 7600 XT (~$329)",
          "RTX 4070 (~$549)",
        ],
      },
      {
        pattern: /(gtx\s*1080|1080)/i,
        name: "GTX 1080",
        upgrades: [
          "RTX 4060 Ti (~$399)",
          "RTX 4070 (~$549)",
          "RX 7800 XT (~$499)",
        ],
      },
      {
        pattern: /(gtx\s*1650|1650)/i,
        name: "GTX 1650",
        upgrades: ["RX 6650 XT (~$189)", "RTX 4060 (~$299)", "RX 7600 (~$269)"],
      },
      {
        pattern: /(gtx\s*1660|1660)/i,
        name: "GTX 1660",
        upgrades: ["RX 6650 XT (~$189)", "RTX 4060 (~$299)", "RX 7600 (~$269)"],
      },
      // RTX 20xx/30xx Series
      {
        pattern: /(rtx\s*2060|2060)/i,
        name: "RTX 2060",
        upgrades: [
          "RTX 4060 (~$299)",
          "RTX 4060 Ti (~$399)",
          "RX 7600 XT (~$329)",
        ],
      },
      {
        pattern: /(rtx\s*2070|2070)/i,
        name: "RTX 2070",
        upgrades: [
          "RTX 4060 Ti (~$399)",
          "RTX 4070 (~$549)",
          "RX 7800 XT (~$499)",
        ],
      },
      {
        pattern: /(rtx\s*2080|2080)/i,
        name: "RTX 2080",
        upgrades: [
          "RTX 4070 (~$549)",
          "RTX 4070 Super (~$599)",
          "RX 7900 XT (~$699)",
        ],
      },
      {
        pattern: /(rtx\s*3060|3060)/i,
        name: "RTX 3060",
        upgrades: [
          "RTX 4060 Ti (~$399)",
          "RTX 4070 (~$549)",
          "RX 7800 XT (~$499)",
        ],
      },
      {
        pattern: /(rtx\s*3070|3070)/i,
        name: "RTX 3070",
        upgrades: ["RTX 4070 Super (~$599)", "RTX 4070 Ti Super (~$799)"],
      },
      // AMD RX Series
      {
        pattern: /(rx\s*580|rx580)/i,
        name: "RX 580",
        upgrades: ["RX 6650 XT (~$189)", "RTX 4060 (~$299)", "RX 7600 (~$269)"],
      },
      {
        pattern: /(rx\s*5700|5700\s*xt)/i,
        name: "RX 5700 XT",
        upgrades: [
          "RX 7600 XT (~$329)",
          "RTX 4060 Ti (~$399)",
          "RX 7800 XT (~$499)",
        ],
      },
      // Older GTX Series (700/900)
      {
        pattern: /(gtx\s*9\d{2}|gtx\s*980|gtx\s*970|gtx\s*960|gtx\s*950)/i,
        name: "GTX 900 series",
        upgrades: ["RX 6650 XT (~$189)", "RTX 4060 (~$299)", "RX 7600 (~$269)"],
      },
      {
        pattern: /(gtx\s*7\d{2}|gtx\s*780|gtx\s*770|gtx\s*760|gtx\s*750)/i,
        name: "GTX 700 series",
        upgrades: ["RX 6650 XT (~$189)", "RTX 4060 (~$299)", "RX 7600 (~$269)"],
      },
      {
        pattern: /(gtx\s*6\d{2}|gtx\s*5\d{2})/i,
        name: "Old GTX (500/600)",
        upgrades: [
          "Literally anything modern!",
          "RX 6650 XT (~$189)",
          "RTX 4060 (~$299)",
        ],
      },
      // Old AMD (R9, R7, HD)
      {
        pattern: /(r9\s*\d{3}|r9\s*290|r9\s*380|r9\s*fury)/i,
        name: "AMD R9 series",
        upgrades: ["RX 6650 XT (~$189)", "RTX 4060 (~$299)", "RX 7600 (~$269)"],
      },
      {
        pattern: /(r7\s*\d{3}|hd\s*\d{4})/i,
        name: "Old AMD (R7/HD)",
        upgrades: ["RX 6650 XT (~$189)", "RTX 4060 (~$299)", "RX 7600 (~$269)"],
      },
      // WORKSTATION GPUs (Quadro, FirePro, Professional) - includes common typos
      {
        pattern: /(quadr[oa]\s*m\d{3,4}|quadr[oa]\s*k\d{3,4})/i,
        name: "Quadro (Maxwell/Kepler)",
        upgrades: [
          "RTX 4060 (~$299) - Gaming/General",
          "RTX A2000 (~$450) - Professional",
          "RTX 4070 (~$549) - Hybrid",
        ],
      },
      {
        pattern: /(quadro\s*p\d{3,4})/i,
        name: "Quadro P-series",
        upgrades: [
          "RTX 4060 Ti (~$399) - Gaming/General",
          "RTX A2000 (~$450) - Professional",
          "RTX A4000 (~$999) - Pro workstation",
        ],
      },
      {
        pattern: /(quadro\s*rtx\s*\d{4})/i,
        name: "Quadro RTX",
        upgrades: [
          "RTX 4070 (~$549) - Gaming/General",
          "RTX A4000 (~$999) - Professional",
          "RTX A5000 (~$1999) - High-end Pro",
        ],
      },
      {
        pattern: /(firepro|radeon\s*pro\s*w)/i,
        name: "AMD FirePro/Radeon Pro",
        upgrades: [
          "RX 7600 (~$269) - Budget",
          "RTX 4060 (~$299) - Value",
          "Radeon PRO W7600 (~$599) - Pro",
        ],
      },
      {
        pattern: /(tesla|a100|a40|a30|v100)/i,
        name: "NVIDIA Tesla/Datacenter",
        upgrades: [
          "⚠️ Enterprise hardware - consult your IT team",
          "RTX 4090 (~$1599) for workstation use",
        ],
      },
    ];

    // Detect if user mentions a specific old CPU
    const oldCpuPatterns = [
      {
        pattern: /(i5[\s-]*(4|5|6|7)(\d{3}))/i,
        name: "older i5",
        upgrades: [
          "Intel i3-12100F (~$99)",
          "Ryzen 5 5600 (~$130)",
          "Intel i5-12400F (~$149)",
        ],
      },
      {
        pattern: /(i7[\s-]*(4|5|6|7)(\d{3}))/i,
        name: "older i7",
        upgrades: [
          "Ryzen 5 7600 (~$199)",
          "Intel i5-13400F (~$199)",
          "Ryzen 7 5700X (~$179)",
        ],
      },
      {
        pattern: /(ryzen\s*3\s*(1|2|3)(\d{3}))/i,
        name: "older Ryzen 3",
        upgrades: ["Ryzen 5 5600 (~$130)", "Intel i3-12100F (~$99)"],
      },
      {
        pattern: /(ryzen\s*5\s*(1|2|3)(\d{3}))/i,
        name: "older Ryzen 5",
        upgrades: [
          "Ryzen 5 5600 (~$130)",
          "Ryzen 5 7600 (~$199)",
          "Intel i5-13400F (~$199)",
        ],
      },
      {
        pattern: /(fx[\s-]*\d{4})/i,
        name: "AMD FX",
        upgrades: [
          "Ryzen 5 5600 + B550 (~$230)",
          "Intel i3-12100F + B660 (~$200)",
        ],
      },
    ];

    // Check for specific GPU upgrade request
    for (const gpu of oldGpuPatterns) {
      if (gpu.pattern.test(lower)) {
        return {
          text: `## 🎮 Upgrading from ${gpu.name}\n\nGreat news - there are some solid upgrade paths for you!\n\n### Recommended GPU Upgrades:\n\n| GPU | Why It's Good |\n|-----|---------------|\n| **${gpu.upgrades[0]}** | Best value - significant performance jump |\n| **${gpu.upgrades[1]}** | Sweet spot - great all-around choice |\n${gpu.upgrades[2] ? `| **${gpu.upgrades[2]}** | Premium option |` : ""}\n\n**Notes:**\n• These GPUs should work with your current system\n• Check your PSU wattage (550W+ recommended)\n• Make sure your case fits the new card\n\nWant me to help you pick one based on your budget?`,
          suggestions: [
            "Which fits my budget?",
            "Check PSU requirements",
            "Full PC build instead?",
          ],
        };
      }
    }

    // Check for specific CPU upgrade request
    for (const cpu of oldCpuPatterns) {
      if (cpu.pattern.test(lower)) {
        return {
          text: `## 💻 Upgrading from ${cpu.name}\n\n⚠️ **Important:** CPU upgrades usually need a new motherboard too!\n\n### Recommended Upgrade Paths:\n\n| CPU | New Motherboard Needed? |\n|-----|------------------------|\n${cpu.upgrades.map((u) => `| **${u}** | Yes (new socket) |`).join("\n")}\n\n**What you'll need:**\n• New CPU\n• New motherboard (different socket)\n• Possibly new RAM (DDR4/DDR5)\n\n**Tip:** If you're upgrading CPU + motherboard + RAM, it might be worth considering a full rebuild for the best value.\n\nWhat's your total budget for the upgrade?`,
          suggestions: [
            "Budget for CPU upgrade?",
            "Do I need new RAM?",
            "Build a new PC instead",
          ],
        };
      }
    }

    // SMART FALLBACK: User mentioned GPU upgrade but we don't recognize the specific card
    if (/(gpu|graphics|video\s*card|graphic\s*card)/i.test(lower)) {
      setAwaiting("gpu"); // Remember we asked for GPU info
      return {
        text: `## 🎮 GPU Upgrade Help\n\nI don't recognize that specific GPU model, but here's general upgrade guidance:\n\n| Your GPU Age | Recommended Upgrades |\n|--------------|---------------------|\n| **10+ years old** | RX 6650 XT (~$189) or RTX 4060 (~$299) |\n| **5-10 years old** | RTX 4060 Ti (~$399) or RX 7700 XT (~$449) |\n| **3-5 years old** | RTX 4070 (~$549) or RX 7800 XT (~$499) |\n\n**For workstation GPUs** (Quadro, FirePro):\n• Gaming → RTX 4060/4070 works great\n• Professional work → Consider RTX A-series\n\n**Tell me the exact model** (like "GTX 1060" or "Quadro M4000") and I'll give you specific recommendations!`,
        suggestions: ["GTX 1060", "Quadro M4000", "RX 580"],
      };
    }

    // Generic upgrade advice (no specific component mentioned)
    // BUT FIRST: Check if user has a build - analyze IT!
    const buildParts = getBuildSummary();
    if (buildParts && buildParts.length > 0) {
      // User HAS a build - analyze it for upgrades
      const gpu = context.currentBuild?.parts?.gpu;
      const cpu = context.currentBuild?.parts?.cpu;
      const ram = context.currentBuild?.parts?.ram;
      const storage = context.currentBuild?.parts?.storage;

      const gpuName = gpu?.name || gpu?.title;
      const cpuName = cpu?.name || cpu?.title;
      const ramName = ram?.name || ram?.title;
      const storageName = storage?.name || storage?.title;

      let upgradeText = `## 🔧 Upgrade Suggestions for Your Build\n\nBased on your current setup:\n\n`;
      let suggestions = [];

      // GPU analysis
      if (gpuName) {
        // Determine GPU tier and suggest upgrade
        if (/4090|7900\s*xtx/i.test(gpuName)) {
          upgradeText += `### GPU: ${gpuName}\n✅ **Already top-tier!** No upgrade needed.\n\n`;
        } else if (/4080|7900\s*xt(?!x)/i.test(gpuName)) {
          upgradeText += `### GPU: ${gpuName}\n✅ **High-end GPU.** Only upgrade if you need 4K ultra.\n- Upgrade path: ${partLink("RTX 4090")}\n\n`;
          suggestions.push("RTX 4090 details");
        } else if (/4070|7800/i.test(gpuName)) {
          upgradeText += `### GPU: ${gpuName}\n🟢 **Great GPU!** Good for 1440p gaming.\n- For 4K: Consider ${partLink("RTX 4080 Super")} or ${partLink("RX 7900 XTX")}\n\n`;
          suggestions.push("RTX 4080 Super");
        } else if (/4060|7600|3060|6650|6700/i.test(gpuName)) {
          upgradeText += `### GPU: ${gpuName}\n🟡 **Budget/1080p GPU.** Upgrade for higher resolution:\n- Best value: ${partLink("RTX 4070")} or ${partLink("RX 7800 XT")}\n- Budget: ${partLink("RTX 4060 Ti")}\n\n`;
          suggestions.push("RTX 4070");
        } else {
          upgradeText += `### GPU: ${gpuName}\n🔴 **Older GPU.** Consider upgrading:\n- Budget: ${partLink("RX 6650 XT")} or ${partLink("RTX 4060")}\n- Mid-tier: ${partLink("RTX 4070")} or ${partLink("RX 7800 XT")}\n\n`;
          suggestions.push("GPU upgrade options");
        }
      }

      // CPU analysis
      if (cpuName) {
        if (/i9|ryzen 9|7950|14900|13900/i.test(cpuName)) {
          upgradeText += `### CPU: ${cpuName}\n✅ **Top-tier CPU!** No upgrade needed.\n\n`;
        } else if (/i7|ryzen 7|7800|7700|14700|13700/i.test(cpuName)) {
          upgradeText += `### CPU: ${cpuName}\n✅ **High-end CPU.** Great for gaming and multitasking.\n\n`;
        } else if (/i5|ryzen 5|7600|13600|14600|13400/i.test(cpuName)) {
          upgradeText += `### CPU: ${cpuName}\n🟢 **Solid gaming CPU!**\n- For streaming: ${partLink("AMD Ryzen 7 7800X3D")} or ${partLink("Intel Core i7-14700K")}\n\n`;
          suggestions.push("Ryzen 7 7800X3D");
        } else {
          upgradeText += `### CPU: ${cpuName}\n🟡 **Consider upgrading for modern games.**\n- Gaming: ${partLink("AMD Ryzen 5 7600")} or ${partLink("Intel Core i5-13400F")}\n- Note: May need new motherboard\n\n`;
          suggestions.push("CPU upgrade options");
        }
      }

      // RAM check
      if (ramName) {
        const ramMatch = ramName.match(/(\d+)\s*GB/i);
        const ramSize = ramMatch ? parseInt(ramMatch[1]) : 0;
        if (ramSize >= 32) {
          upgradeText += `### RAM: ${ramName}\n✅ **Plenty of RAM!**\n\n`;
        } else if (ramSize >= 16) {
          upgradeText += `### RAM: ${ramName}\n🟢 **Good for gaming.** Upgrade to 32GB for streaming/editing.\n\n`;
        } else {
          upgradeText += `### RAM: ${ramName}\n🔴 **Low RAM!** Upgrade to 16GB or 32GB for better performance.\n\n`;
          suggestions.push("Upgrade RAM");
        }
      }

      if (suggestions.length === 0) {
        suggestions = [
          "Check for bottleneck",
          "Show my build",
          "What games can I run?",
        ];
      }

      return {
        text: upgradeText,
        suggestions: suggestions.slice(0, 3),
      };
    }

    // No build - ask for component info
    setAwaiting("component"); // Remember we asked for component info
    return {
      text: '## Upgrade Priority Guide\n\nThe best upgrade depends on your current bottleneck:\n\n| Symptom | Likely Issue | Fix |\n|---------|--------------|-----|\n| Low FPS in games | Weak GPU | Upgrade GPU |\n| Stuttering/freezing | Not enough RAM | Add more RAM |\n| Slow loading | Old HDD | Get an SSD |\n| CPU at 100% | Weak CPU | Upgrade CPU |\n\n**To help you better:** Tell me your current GPU or CPU (like "GTX 1060" or "i5-4690k") and I\'ll give you specific upgrade suggestions!',
      suggestions: ["GTX 1060", "Quadro M4000", "Ryzen 5 3600"],
    };
  }

  // 9. STREAMING SPECIFIC (no budget specified)
  if (intents.isStreaming && !intents.budget) {
    const defaultBudget = 1200;
    const build = generateBuildTable("streaming", defaultBudget, false);
    return {
      text: `## Recommended Streaming Build\n\n**Target:** ${formatPrice(defaultBudget)}\n**Total:** ~$${build.total}\n\n${build.table}\n\n### Compatibility\n${build.compatNotes}\n\n### Recommendation Notes\n${build.reasoning}`,
      suggestions: ["Increase budget", "Compare alternatives", "Cheaper build"],
    };
  }

  // 10. WORKSTATION SPECIFIC (no budget specified)
  if (intents.isWork && !intents.budget) {
    const isCheap = /(cheap|budget|affordable|low cost)/.test(lower);
    const defaultBudget = isCheap ? 800 : 1500;
    const build = generateBuildTable("work", defaultBudget, false);
    return {
      text: `## Recommended Workstation\n\n**Target:** ${formatPrice(defaultBudget)}\n**Total:** ~$${build.total}\n\n${build.table}\n\n### Compatibility\n${build.compatNotes}\n\n### Recommendation Notes\n${build.reasoning}`,
      suggestions: ["Increase budget", "Compare alternatives", "Editing focus"],
    };
  }

  // 11. GAMING QUESTION (no budget)
  if (intents.isGaming && !intents.budget) {
    return {
      text: "## Gaming PC Builds by Budget\n\n| Budget | What You Get |\n|--------|-------------|\n| **$800** | 1080p 60+ FPS |\n| **$1200** | 1080p 144+ FPS |\n| **$1500** | 1440p 100+ FPS |\n| **$2000** | 1440p 144+ FPS |\n| **$2500+** | 4K 60+ FPS |\n\n**What's your target budget?** I'll design the perfect build.",
      suggestions: ["$1000 gaming PC", "$1500 gaming PC", "$2000 gaming PC"],
    };
  }

  // 12. THANKS / POSITIVE
  if (
    /(thanks|thank you|thx|appreciate|awesome|great|perfect|cool)/i.test(lower)
  ) {
    return {
      text: "No problem! 🙌 Need anything else?\n\nI can help you tweak the build, try a different budget, or answer questions about specific parts.",
      suggestions: [
        "Adjust my build",
        "Different budget",
        "Tell me about GPUs",
      ],
    };
  }

  // 14. TROUBLESHOOTING QUESTIONS
  const troubleshootPatterns = [
    {
      pattern:
        /(no post|wont post|won't post|no display|no boot|won't boot|wont boot|no signal)/i,
      key: "no post",
    },
    { pattern: /(blue screen|bsod|crash|crashing)/i, key: "blue screen" },
    {
      pattern: /(overheating|too hot|high temps|thermal throttl)/i,
      key: "overheating",
    },
    {
      pattern: /(low fps|bad fps|poor performance|stuttering|stutter)/i,
      key: "low fps",
    },
    {
      pattern: /(gpu not detected|no gpu|gpu missing)/i,
      key: "no gpu detected",
    },
    {
      pattern: /(ram not detected|wrong ram speed|ram issue)/i,
      key: "ram not detected",
    },
    { pattern: /(coil whine|buzzing|noise)/i, key: "coil whine" },
  ];

  for (const { pattern, key } of troubleshootPatterns) {
    if (pattern.test(lower)) {
      const issue = TROUBLESHOOTING[key];
      if (issue) {
        let text = `## 🔧 Troubleshooting: ${issue.issue}\n\n`;
        text += `### Common Causes\n`;
        issue.causes.forEach((c) => (text += `• ${c}\n`));
        text += `\n### Solutions\n`;
        issue.solutions.forEach((s) => (text += `${s}\n`));
        text += `\n### Prevention\n${issue.prevention}`;
        return {
          text,
          suggestions: ["Still not working", "Other issue", "Build a new PC"],
        };
      }
    }
  }

  // 15. TERMINOLOGY QUESTIONS (direct)
  const termPatterns = [
    /what(?:'s| is)(?: a| an| the)?\s*(tdp|vram|cuda|dlss|fsr|nvme|pcie|ddr4|ddr5|xmp|expo|socket|chipset|vrm|atx|aio|psu|m\.2|refresh rate|response time|gsync|freesync|ips|va|oled|hdr|bottleneck|overclocking|ray tracing)/i,
    /(?:explain|define|meaning of)\s*(tdp|vram|cuda|dlss|fsr|nvme|pcie|ddr4|ddr5|xmp|expo|socket|chipset|vrm|atx|aio|psu|m\.2|refresh rate|response time|gsync|freesync|ips|va|oled|hdr|bottleneck|overclocking|ray tracing)/i,
  ];

  for (const pattern of termPatterns) {
    const match = lower.match(pattern);
    if (match && match[1]) {
      const termKey = match[1].toLowerCase();
      const term = TERMINOLOGY[termKey];
      if (term) {
        return {
          text: `## ${term.term}\n\n${term.definition}\n\n**Example:** ${term.example}`,
          suggestions: term.relatedTerms
            ? term.relatedTerms.slice(0, 3).map((t) => `What is ${t}?`)
            : ["Build a PC", "Compare parts"],
        };
      }
    }
  }

  // 16. UPGRADE QUESTIONS
  if (
    /(should i upgrade|what to upgrade|upgrade advice|best upgrade)/i.test(
      lower,
    )
  ) {
    let text = `## 🔧 Upgrade Priority Guide\n\n`;
    UPGRADE_ADVICE.bestUpgrades.forEach((u) => {
      text += `### ${u.priority}. ${u.upgrade}\n`;
      text += `**Impact:** ${u.impact}\n`;
      text += `**Cost:** ${u.cost}\n\n`;
    });
    text += `\n### When to Upgrade Each Component\n`;
    text += `• **GPU:** ${UPGRADE_ADVICE.whenToUpgrade.gpu}\n`;
    text += `• **CPU:** ${UPGRADE_ADVICE.whenToUpgrade.cpu}\n`;
    text += `• **RAM:** ${UPGRADE_ADVICE.whenToUpgrade.ram}\n`;
    return {
      text,
      suggestions: [
        "Check my build",
        "Best GPU upgrade?",
        "Build new PC instead",
      ],
    };
  }

  // 17. COMPATIBILITY QUESTIONS
  if (
    /(compatible|compatibility|will.*work|can i use|does.*fit)/i.test(lower)
  ) {
    let text = `## ✅ PC Compatibility Guide\n\n`;
    text += `### CPU + Motherboard\n${COMPATIBILITY.cpuMotherboard.rule}\n\n`;
    text += `**Examples:**\n`;
    COMPATIBILITY.cpuMotherboard.examples.forEach((ex) => {
      text += `• ${ex.cpu} → ${ex.socket} (${ex.chipsets.join(", ")})\n`;
    });
    text += `\n### RAM Compatibility\n${COMPATIBILITY.ramMotherboard.rule}\n\n`;
    text += `### GPU Size\n${COMPATIBILITY.gpuCase.rule}\n${COMPATIBILITY.gpuCase.tips}\n\n`;
    text += `### PSU Wattage\n${COMPATIBILITY.psuWattage.rule}\n**Formula:** ${COMPATIBILITY.psuWattage.formula}`;
    return {
      text,
      suggestions: ["Check specific parts", "Build me a PC", "PSU calculator"],
    };
  }

  // Value Analysis - "Is there something better for the price?"
  const valuePattern =
    /(better|faster|improvement|worth it).*(same|similar|close).*(price|cost|money|budget)/i;
  const checkBuildPattern =
    /(check|analyze|judge|rate|scan).*(my build|my pc|my list)/i;

  // Trigger if explicitly asking for value, OR asking to check build (implicit value check)
  if (
    valuePattern.test(lower) ||
    (checkBuildPattern.test(lower) && /(value|price|cheaper|save)/i.test(lower))
  ) {
    const parts = context.currentBuild?.parts || {};
    const suggestions = [];

    // 1. Defining "Value Killers" - Parts that offer better bang-for-buck
    const valueSwaps = [
      // CPU Swaps
      {
        target: /14900k|13900k|14700k/i,
        better: "Ryzen 7 7800X3D",
        priceDiff: "-$100",
        reason:
          "Better gaming performance, uses 50% less power, and costs less!",
        type: "gaming",
      },
      {
        target: /13400|12400|14400/i,
        better: "Ryzen 5 7600",
        priceDiff: "Same",
        reason:
          "Similar speed but puts you on the newer AM5 platform for future upgrades.",
        type: "gaming",
      },
      {
        target: /5600g|5700g/i,
        better: "Ryzen 5 5600",
        priceDiff: "Same",
        reason:
          'The "G" models have less cache and are slower for gaming if you have a GPU.',
        type: "gaming",
      },
      // GPU Swaps
      {
        target: /4060 ti|3060 ti/i,
        better: "RX 7700 XT",
        priceDiff: "+$30",
        reason: "Significantly faster raster performance and 12GB VRAM vs 8GB.",
        type: "gaming",
      },
      {
        target: /3050|1650/i,
        better: "RX 6600",
        priceDiff: "Same",
        reason:
          "The RX 6600 is almost 2x faster than a 3050 for the same price.",
        type: "gaming",
      },
      {
        target: /4080/i,
        better: "RX 7900 XTX",
        priceDiff: "-$100",
        reason:
          "More VRAM (24GB) and faster raster performance for less money (unless you need DLSS/Ray Tracing).",
        type: "gaming",
      },
      // RAM Swaps
      {
        target: /dominator|trident z5 royal/i,
        better: "G.Skill Flare X5 / TeamGroup Delta",
        priceDiff: "-$50",
        reason:
          "You are paying a premium for aesthetics. These sticks perform exactly the same.",
        type: "budget",
      },
      // Storage Swaps
      {
        target: /990 pro|sn850x/i,
        isBudgetBuild: true, // Only trigger if budget < 1500 (logic handled below)
        better: "Crucial P3 Plus / WD SN770",
        priceDiff: "-$40",
        reason:
          "For gaming, you won't notice the speed difference of top-tier drives.",
        type: "budget",
      },
    ];

    // Scan all parts
    Object.entries(parts).forEach(([key, part]) => {
      if (!part) return;
      const name = part.name || part.title;
      const swap = valueSwaps.find((s) => s.target.test(name));

      // Context checks (e.g. don't suggest budget SSD for a $3000 build)
      if (swap) {
        if (swap.isBudgetBuild && context.currentBuild.total > 1500) return;

        suggestions.push({
          part: name,
          better: swap.better,
          diff: swap.priceDiff,
          reason: swap.reason,
        });
      }
    });

    if (suggestions.length > 0) {
      let text = `## 💰 Value Analysis\n\nI found **${suggestions.length} potential swap${suggestions.length > 1 ? "s" : ""}** to get you better performance for the price!\n\n`;

      suggestions.forEach((s) => {
        const partLink = `[${s.part}](nexus://part/${encodeURIComponent(s.part)})`;
        const betterLink = `[${s.better}](nexus://part/${encodeURIComponent(s.better)})`;

        text += `### 🔄 Swap ${partLink} ➡️ ${betterLink}\n`;
        text += `**Impact:** ${s.diff}\n`;
        text += `**Why:** ${s.reason}\n\n`;
      });

      text += `Tap a link to open the part.`;

      return {
        text,
        suggestions: [
          "Apply all swaps",
          "Explain why",
          "Keep my current parts",
        ],
      };
    } else if (Object.keys(parts).length > 0) {
      return {
        text: `## ✅ Value Check Passed!\n\nI scanned your build and honestly? **It's solid.**\n\nEvery part you've picked offers great performance for its price point. I wouldn't change a thing!`,
        suggestions: ["Check compatibility", "Bottleneck check", "What else?"],
      };
    } else {
      return {
        text: `## 💰 Value Finder\n\nI can't check your build because it's empty! 😅\n\nAdd some parts first, or ask me to **"Build me a gaming PC for $1000"** and I'll start you off with a high-value list.`,
        suggestions: [
          "Build Gaming PC $1000",
          "Best value CPU",
          "Best value GPU",
        ],
      };
    }
  }

  // 18. BOTTLENECK QUESTIONS - Smart detection with tier-matching guidance
  // Now checks the user's current build for GPU/CPU to provide personalized advice!
  const isBottleneckQuestion = /(bottleneck|bottle-neck|bottle neck)/i.test(
    lower,
  );
  const wantsToFix =
    /(fix|solve|resolve|reduce|eliminate|improve|help|what can i do)/i.test(
      lower,
    );

  if (isBottleneckQuestion) {
    const entities = extractEntities(message);

    // Check user's current build for GPU and CPU
    const buildGpu = context.currentBuild?.parts?.gpu;
    const buildCpu = context.currentBuild?.parts?.cpu;

    // Determine what components we know about (from message OR from build)
    const hasGpuInMessage =
      entities.gpu ||
      /(gpu|graphics|video\s*card|rtx|gtx|rx|radeon|geforce)/i.test(lower);
    const hasCpuInMessage =
      entities.cpu ||
      /(cpu|processor|ryzen|intel|i[3579]-?\d{4,5})/i.test(lower);

    // Get component names - prioritize build context, then message entities
    const gpuName = buildGpu?.name || buildGpu?.title || entities.gpu;
    const cpuName = buildCpu?.name || buildCpu?.title || entities.cpu;

    const hasGpu = gpuName || hasGpuInMessage;
    const hasCpu = cpuName || hasCpuInMessage;

    // User has GPU in build but no CPU - ask for CPU with personalized response
    if ((buildGpu || hasGpuInMessage) && !buildCpu && !hasCpuInMessage) {
      const displayGpu = gpuName || "your GPU";
      setAwaiting("cpu");
      return {
        text: `## 🎯 Bottleneck Check for ${displayGpu}\n\n${buildGpu ? `I see you have the **${displayGpu}** in your current build! Great choice. 👍\n\n` : ""}To check for a bottleneck, I need to know which **CPU** you're pairing with ${buildGpu ? "it" : "that GPU"}.\n\n**Quick Tier Matching Guide:**\n\n| GPU Tier | Recommended CPUs |\n|----------|------------------|\n| **Entry-level** (RTX 4060, RX 7600) | i5-13400, Ryzen 5 7600 |\n| **Mid-range** (RTX 4070, RX 7800 XT) | i5-14600K, Ryzen 5 7600X |\n| **High-end** (RTX 4080, RX 7900 XTX) | i7-14700K, Ryzen 7 7800X3D |\n| **Flagship** (RTX 4090) | i9-14900K, Ryzen 9 7950X3D |\n\n**What CPU are you thinking of using?**`,
        suggestions: ["Ryzen 5 7600", "Intel i5-13400", "Ryzen 7 7800X3D"],
      };
    }

    // User has CPU in build but no GPU - ask for GPU with personalized response
    if ((buildCpu || hasCpuInMessage) && !buildGpu && !hasGpuInMessage) {
      const displayCpu = cpuName || "your CPU";
      setAwaiting("gpu");
      return {
        text: `## 🎯 Bottleneck Check for ${displayCpu}\n\n${buildCpu ? `I see you have the **${displayCpu}** in your current build! Solid pick. 💪\n\n` : ""}To check for a bottleneck, I need to know which **GPU** you're pairing with ${buildCpu ? "it" : "that CPU"}.\n\n**Quick Tier Matching Guide:**\n\n| CPU Tier | Recommended GPUs |\n|----------|------------------|\n| **Budget** (i3, Ryzen 3) | RTX 4060, RX 7600 |\n| **Mid-range** (i5, Ryzen 5) | RTX 4070, RX 7800 XT |\n| **High-end** (i7, Ryzen 7) | RTX 4080, RX 7900 XTX |\n| **Enthusiast** (i9, Ryzen 9) | RTX 4090 |\n\n**What GPU are you thinking of using?**`,
        suggestions: ["RTX 4070", "RX 7800 XT", "RTX 4060"],
      };
    }

    // User has BOTH GPU and CPU in build - analyze the pairing!
    if ((buildGpu || hasGpu) && (buildCpu || hasCpu)) {
      const displayGpu = gpuName || "your GPU";
      const displayCpu = cpuName || "your CPU";
      const fromBuild = buildGpu && buildCpu;

      // Determine component tiers for fix recommendations
      const getCpuTier = (name) => {
        if (!name) return "unknown";
        const n = name.toLowerCase();
        if (/i9|ryzen 9|7950|14900|13900/i.test(n)) return "enthusiast";
        if (/i7|ryzen 7|7800|7700|14700|13700/i.test(n)) return "high";
        if (/i5|ryzen 5|7600|13600|14600|13400/i.test(n)) return "mid";
        if (/i3|ryzen 3/i.test(n)) return "budget";
        return "unknown";
      };

      const getGpuTier = (name) => {
        if (!name) return "unknown";
        const n = name.toLowerCase();
        if (/4090|7900\s*xtx/i.test(n)) return "flagship";
        if (/4080|7900\s*xt(?!x)/i.test(n)) return "high";
        if (/4070|7800/i.test(n)) return "mid";
        if (/4060|7600|3060|6650|6700/i.test(n)) return "budget";
        return "unknown";
      };

      const cpuTier = getCpuTier(displayCpu);
      const gpuTier = getGpuTier(displayGpu);

      // Determine bottleneck direction and fix recommendations
      const tierOrder = {
        budget: 1,
        mid: 2,
        high: 3,
        enthusiast: 4,
        flagship: 4,
        unknown: 2,
      };
      const cpuLevel = tierOrder[cpuTier];
      const gpuLevel = tierOrder[gpuTier];
      const diff = cpuLevel - gpuLevel;

      let bottleneckAnalysis = "";
      let fixRecommendations = "";
      let bottleneckType = "balanced";

      if (diff >= 2) {
        // CPU is much stronger than GPU - GPU bottleneck
        bottleneckType = "gpu";
        bottleneckAnalysis = `⚠️ **GPU Bottleneck Detected!**\n\nYour **${displayCpu}** (${cpuTier}-tier) is significantly more powerful than your **${displayGpu}** (${gpuTier}-tier). The GPU is limiting your performance.`;
        fixRecommendations = `### 🔧 How to Fix This:\n\n**Option 1: Upgrade GPU** (Best fix)\n| Your GPU | Upgrade To | Expected Improvement |\n|----------|------------|----------------------|\n| ${displayGpu} | RTX 4070 Super | +40-60% FPS |\n| ${displayGpu} | RTX 4080 | +80-100% FPS |\n| ${displayGpu} | RX 7800 XT | +50-70% FPS |\n\n**Option 2: Increase Resolution**\nPlaying at **1440p or 4K** shifts more work to the GPU, better utilizing both components.\n\n**Option 3: Enable Ray Tracing**\nRay tracing is GPU-heavy and will balance the workload.`;
      } else if (diff <= -2) {
        // GPU is much stronger than CPU - CPU bottleneck
        bottleneckType = "cpu";
        bottleneckAnalysis = `⚠️ **CPU Bottleneck Detected!**\n\nYour **${displayGpu}** (${gpuTier}-tier) is significantly more powerful than your **${displayCpu}** (${cpuTier}-tier). The CPU is limiting your GPU's potential.`;
        fixRecommendations = `### 🔧 How to Fix This:\n\n**Option 1: Upgrade CPU** (Best fix)\n| Your CPU | Upgrade To | Expected Improvement |\n|----------|------------|----------------------|\n| ${displayCpu} | Ryzen 7 7800X3D | Best gaming CPU |\n| ${displayCpu} | Intel i7-14700K | Great all-rounder |\n| ${displayCpu} | Ryzen 5 7600X | Budget-friendly boost |\n\n**Option 2: Increase Resolution**\nAt **1440p/4K**, the CPU matters less and your GPU does the heavy lifting.\n\n**Option 3: Limit FPS**\nCapping to 120 FPS reduces CPU load while maintaining smooth gameplay.`;
      } else if (Math.abs(diff) === 1) {
        // Slight imbalance
        bottleneckType = diff > 0 ? "slight-gpu" : "slight-cpu";
        bottleneckAnalysis = `✅ **Minor Imbalance (Acceptable)**\n\nYour **${displayCpu}** and **${displayGpu}** are close in tier. There's a slight ${diff > 0 ? "GPU" : "CPU"} limitation, but it's minimal (<10%).`;
        fixRecommendations = `### 💡 Minor Tweaks (Optional):\n\n${
          diff > 0
            ? `- Consider a GPU upgrade when budget allows\n- Play at higher resolutions to balance workload\n- Enable DLSS/FSR for better GPU utilization`
            : `- Consider a CPU upgrade for max FPS at 1080p\n- At 1440p/4K, your current setup is fine\n- Close background apps to free CPU resources`
        }\n\n**Verdict:** Your build is well-balanced! No urgent changes needed.`;
      } else {
        // Well balanced
        bottleneckAnalysis = `✅ **Perfectly Balanced!**\n\nYour **${displayCpu}** and **${displayGpu}** are well-matched. No significant bottleneck detected!`;
        fixRecommendations = `### 🎮 You're Good to Go!\n\nYour components are properly tier-matched. Enjoy your gaming!\n\n**Pro Tips:**\n- At **1080p**: Expect CPU-limited scenarios in competitive games (this is normal)\n- At **1440p**: Perfect balance for most games\n- At **4K**: GPU does most of the work, your setup handles it`;
      }

      // If user specifically asked to FIX, emphasize the fix recommendations
      if (
        wantsToFix &&
        (bottleneckType === "gpu" || bottleneckType === "cpu")
      ) {
        return {
          text: `## 🔧 Fixing Your Bottleneck\n\n${bottleneckAnalysis}\n\n${fixRecommendations}\n\n---\n\n**Want me to suggest specific parts?** I can recommend exact models based on your budget!`,
          suggestions: [
            "Recommend a GPU upgrade",
            "Recommend a CPU upgrade",
            "What's my budget option?",
          ],
        };
      }

      return {
        text: `## 🎯 Bottleneck Analysis: ${displayCpu} + ${displayGpu}\n\n${fromBuild ? `Looking at your current build:\n- **CPU:** ${displayCpu}\n- **GPU:** ${displayGpu}\n\n` : ""}${bottleneckAnalysis}\n\n${fixRecommendations}`,
        suggestions: bottleneckType.includes("gpu")
          ? ["Upgrade GPU options", "Keep current build", "Check at 1440p"]
          : bottleneckType.includes("cpu")
            ? ["Upgrade CPU options", "Keep current build", "Check at 4K"]
            : ["Check compatibility", "Show my build", "Other questions"],
      };
    }

    // User asked about bottleneck but has nothing in build and didn't mention components
    setAwaiting("component");
    return {
      text: `## 🎯 Bottleneck Prevention Guide\n\nA **bottleneck** happens when one component holds back another.\n\n${context.currentBuild ? `💡 **Tip:** Add some parts to your build and I can check them for you!\n\n` : ""}### Quick Rules to Avoid Bottlenecks:\n\n**1. Tier Matching** - Pair similar-tier components:\n| GPU | Pair With |\n|-----|-----------|\n| RTX 4060 / RX 7600 | i5-13400 / Ryzen 5 7600 |\n| RTX 4070 / RX 7800 XT | i5-14600K / Ryzen 5 7600X |\n| RTX 4080 / RX 7900 XTX | i7-14700K / Ryzen 7 7800X3D |\n| RTX 4090 | i9-14900K / Ryzen 9 7950X3D |\n\n**2. The 10% Rule** - Keep bottleneck under 10% for a balanced build.\n\n**3. Resolution Matters** - At 1440p/4K, a slightly weaker CPU is often fine because the GPU does the heavy lifting.\n\n**To check your specific setup:**\nTell me which **GPU** and **CPU** you're considering, and I'll analyze the pairing!`,
      suggestions: ["RTX 4070 + Ryzen 5 7600", "Check my GPU", "Check my CPU"],
    };
  }

  // SMART PRE-FALLBACK DETECTION - Catch common patterns before giving up
  // User asks about GPU in their build or avoiding bottleneck
  if (
    /(gpu|graphics).*(build|bottleneck|match|pair|avoid)/i.test(lower) ||
    /(build|bottleneck|match|pair|avoid).*(gpu|graphics)/i.test(lower) ||
    /(my build|my builder|in my build).*(gpu|cpu|bottleneck)/i.test(lower)
  ) {
    const buildParts = getBuildSummary();
    if (buildParts && buildParts.length > 0) {
      const gpu = context.currentBuild?.parts?.gpu;
      const cpu = context.currentBuild?.parts?.cpu;
      const gpuName = gpu?.name || gpu?.title;
      const cpuName = cpu?.name || cpu?.title;

      if (gpuName && cpuName) {
        // Has both - do bottleneck check
        return {
          text: `## 🎯 Checking Your Build\n\nI see you have:\n- **GPU:** ${gpuName}\n- **CPU:** ${cpuName}\n\nWould you like me to analyze this pairing for bottlenecks?\n\nOr if you're looking to upgrade, I can suggest better options!`,
          suggestions: [
            "Check for bottleneck",
            "Suggest GPU upgrade",
            "Suggest CPU upgrade",
          ],
        };
      } else if (gpuName) {
        return {
          text: `## 🎯 Your GPU: ${gpuName}\n\nI see you have this GPU in your build! To check for bottlenecks, I also need to know your **CPU**.\n\nIs the CPU already in your build, or what are you considering?`,
          suggestions: [
            "Check my build",
            "Recommend a CPU for this GPU",
            "Show compatible CPUs",
          ],
        };
      } else if (cpuName) {
        return {
          text: `## 🎯 Your CPU: ${cpuName}\n\nI see you have this CPU in your build! To check for bottlenecks, I also need to know your **GPU**.\n\nIs the GPU already in your build, or what are you considering?`,
          suggestions: [
            "Check my build",
            "Recommend a GPU for this CPU",
            "Show compatible GPUs",
          ],
        };
      } else {
        return {
          text: `## 🎯 Let's Check Your Build\n\nI can help with GPU/bottleneck questions! First, tell me:\n\n1. **What GPU** do you have or want?\n2. **What CPU** do you have or want?\n\nOr if you've added parts to your build, say "show my build" and I'll analyze it!`,
          suggestions: [
            "Show my build",
            "RTX 4070 + Ryzen 5 7600",
            "Recommend parts for me",
          ],
        };
      }
    } else {
      return {
        text: `## 🎯 GPU & Bottleneck Help\n\nI'd love to help you pick a GPU or check for bottlenecks! To do that, I need:\n\n1. **Your budget** (e.g., "$500 for a GPU")\n2. **What CPU you have** (so I can match the GPU properly)\n\nOr tell me about your whole build and I'll analyze everything!`,
        suggestions: [
          "Best GPU for $500",
          "RTX 4070 + Ryzen 5",
          "Help me pick parts",
        ],
      };
    }
  }

  // User mentions "what should I do" with build-related terms
  if (
    /what should i do/i.test(lower) &&
    /(build|gpu|cpu|upgrade|part|bottleneck)/i.test(lower)
  ) {
    const buildParts = getBuildSummary();
    if (buildParts && buildParts.length > 0) {
      return {
        text: `## 🤔 Let Me Help!\n\nI can see you have a build in progress. Here's what I can do:\n\n- **Check compatibility** between your parts\n- **Analyze for bottlenecks** (CPU vs GPU)\n- **Suggest upgrades** based on your current setup\n- **Recommend missing parts**\n\nWhat would you like me to focus on?`,
        suggestions: [
          "Check compatibility",
          "Suggest upgrades",
          "Any bottlenecks?",
        ],
      };
    }
  }

  // DEFAULT / FALLBACK - Improved with related topic detection

  // Try to find a related topic to suggest
  const findRelatedTopic = (msg) => {
    const topics = [
      {
        keywords: ["game", "play", "fps", "steam"],
        topic: "gaming PC builds",
        suggestion: "Gaming PC recommendations",
      },
      {
        keywords: ["edit", "video", "render", "adobe", "premiere"],
        topic: "workstation builds",
        suggestion: "Video editing build",
      },
      {
        keywords: ["stream", "twitch", "obs"],
        topic: "streaming setups",
        suggestion: "Streaming PC build",
      },
      {
        keywords: ["cheap", "afford", "money", "save"],
        topic: "budget builds",
        suggestion: "Budget PC options",
      },
      {
        keywords: ["hot", "temp", "cool", "fan", "heat"],
        topic: "cooling solutions",
        suggestion: "Cooling recommendations",
      },
      {
        keywords: ["noise", "quiet", "silent", "loud"],
        topic: "quiet PC builds",
        suggestion: "Silent PC tips",
      },
      {
        keywords: ["small", "compact", "mini", "space"],
        topic: "small form factor builds",
        suggestion: "Mini ITX builds",
      },
    ];

    for (const t of topics) {
      if (t.keywords.some((k) => msg.toLowerCase().includes(k))) {
        return t;
      }
    }
    return null;
  };

  const relatedTopic = findRelatedTopic(message);

  if (relatedTopic) {
    return {
      text: `I'm not quite sure what you mean, but it sounds like you might be interested in **${relatedTopic.topic}**. Would you like to know more about that?\n\nOr just tell me your budget and I'll build something for you!`,
      suggestions: [relatedTopic.suggestion, "Build me a PC", "Something else"],
    };
  }

  const fallbacks = [
    {
      text: "Hmm, I'm not totally sure what you mean there. But if you've got a PC question, I'm all ears! 👂\n\nTry telling me your **budget** or ask about a specific **part**.",
      suggestions: [
        "$1000 gaming PC",
        "Best GPU right now?",
        "Help me get started",
      ],
    },
    {
      text: "I gotcha! Let me know what you're looking for:\n\n• A **full PC build** (just drop a budget)\n• Info on **specific parts**\n• Help with **upgrades**\n\nWhat sounds good?",
      suggestions: [
        "Gaming PC $1500",
        "Best CPU for gaming?",
        "Upgrade advice",
      ],
    },
    {
      text: "Hey, I'm here to help you build something awesome! 💻\n\nJust give me a **budget** and tell me what you'll use it for (gaming, work, streaming) and I'll make it happen.",
      suggestions: ["$1000 build", "$2000 build", "What should I get?"],
    },
  ];

  // Pick a random fallback for variety - log to analytics for improvement
  logFallback(message);
  const randomFallback =
    fallbacks[Math.floor(Math.random() * fallbacks.length)];
  return randomFallback;
};

export const simulateStreamingResponse = async (
  text,
  onChunk,
  suggestions = [],
) => {
  const tokens = text.split(/(?=[ \n])/);
  for (const token of tokens) {
    await new Promise((r) => setTimeout(r, Math.random() * 20 + 10)); // Slightly faster typing
    onChunk({ token: token, done: false });
  }
  onChunk({ done: true, suggestions });
};

export default { generateSmartResponse, simulateStreamingResponse };
