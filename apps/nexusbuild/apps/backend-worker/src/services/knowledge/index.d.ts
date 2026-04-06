export type KnowledgeListItem = {
  title?: string;
  content?: string;
  triggers?: string[];
};

export type TerminologyEntry = {
  term: string;
  definition: string;
  example: string;
  relatedTerms?: string[];
};

export type TroubleshootingEntry = {
  issue: string;
  symptoms?: string[];
  causes?: string[];
  solutions?: string[];
  prevention?: string;
};

export type BestUpgrade = {
  upgrade: string;
  impact: string;
  cost: string;
};

export const TERMINOLOGY: Record<string, TerminologyEntry>;
export const TROUBLESHOOTING: Record<string, TroubleshootingEntry>;
export const COMPATIBILITY: {
  cpuMotherboard: { rule: string };
  ramMotherboard: { rule: string };
  gpuCase: { rule: string };
  coolerCase: { rule: string };
  psuWattage: { rule: string; tips: string };
};
export const UPGRADE_ADVICE: {
  bestUpgrades: BestUpgrade[];
  upgradeVsNew: string;
};
export const RESPONSE_PATTERNS: Record<string, unknown>;
export const BUILD_ARCHETYPES: Record<
  string,
  {
    name: string;
    target: string;
    notes?: string;
  }
>;
export const GUIDE_KNOWLEDGE: {
  troubleshooting?: KnowledgeListItem[];
  assembly?: KnowledgeListItem[];
  concepts?: KnowledgeListItem[];
  beginner?: KnowledgeListItem[];
  gaming?: KnowledgeListItem[];
};
export const SYNONYM_MAP: {
  useCases?: Record<string, string[]>;
  [key: string]: unknown;
};
export const WORKSTATION_KNOWLEDGE: {
  videoEditing: {
    recommendations: Record<string, string>;
    priorities: Array<{ component: string; note: string }>;
  };
  rendering3D: {
    engines: Record<string, { bestHardware: string }>;
    recommendations: Record<string, string>;
  };
  machineLearning: {
    ruleOfThumb: string;
    notes?: string[];
    requirements?: Record<string, string>;
  };
  musicProduction: {
    priorities: Array<{ component: string; note: string }>;
    notes: string;
  };
  development: {
    scenarios: Record<string, { hardware: string }>;
  };
};
export const MONITOR_KNOWLEDGE: {
  panels: Record<
    string,
    {
      name: string;
      pros?: string[];
      cons?: string[];
      bestFor?: string[];
      note?: string;
      subtypes?: string[];
      recommendations?: string[];
    }
  >;
  resolutions: Record<
    string,
    {
      pixels: string;
      idealSize: string;
      gpuTier: string;
      note: string;
    }
  >;
  recommendations: Record<
    string,
    {
      priority: string;
      topPicks?: string[];
    }
  >;
};
export const PSU_KNOWLEDGE: {
  tiers: Record<string, { series?: string[] }>;
  mistakes: string[];
};
export const AUDIO_KNOWLEDGE: {
  headphones: {
    types: Record<string, { pros?: string[]; cons?: string[] }>;
    recommendations: {
      budget: string;
      competitiveFPS: string;
    };
  };
  microphones: {
    types: Record<string, { bestFor: string }>;
    interfaces: Record<string, { description: string }>;
  };
  dacAmp: {
    basics: Record<string, string>;
    doINeedOne: string[];
  };
};
export const PREBUILT_KNOWLEDGE: {
  redFlags?: Array<{
    term: string;
    check: string;
    severity?: string;
  }>;
  brandTiers?: Record<
    string,
    {
      brands?: string[];
      verdict?: string;
    }
  >;
};
export const LAPTOP_KNOWLEDGE: {
  tgpExplained: {
    title: string;
    explanation: string;
    examples?: string[];
    advice: string;
  };
  displays: {
    recommendations: string[];
  };
  recommendations: Record<
    string,
    {
      why: string;
      topPicks?: string[];
    }
  >;
};
export const ROAST_LOGIC: Record<string, unknown>;

export const GAME_BENCHMARKS: Record<string, unknown>;
export const getFPS: (...args: unknown[]) => unknown;
export const findGPUForFPS: (...args: unknown[]) => unknown;

export const COOLING_RECOMMENDATIONS: Record<string, unknown>;
export const getCoolerForCPU: (...args: unknown[]) => unknown;
export const getCoolerByTDP: (...args: unknown[]) => unknown;

export const BUDGET_BUILDS: Record<string, unknown>;
export const findBuildByBudget: (...args: unknown[]) => unknown;
export const findBuildByTarget: (...args: unknown[]) => unknown;

export const OVERCLOCKING_GUIDE: Record<string, unknown>;
export const getOCGuideForCPU: (...args: unknown[]) => unknown;
export const getSafeTemp: (...args: unknown[]) => unknown;

export const ALL_PARTS: Record<string, unknown>;
export const searchParts: (...args: unknown[]) => any;
export const formatPartInfo: (...args: unknown[]) => string;

export const CPU_DEEP_DIVE: Record<string, unknown>;
export const GPU_DEEP_DIVE: Record<string, unknown>;
export const MOBO_DEEP_DIVE: Record<string, unknown>;
export const RAM_DEEP_DIVE: Record<string, unknown>;
export const STORAGE_DEEP_DIVE: Record<string, unknown>;
export const PSU_DEEP_DIVE: Record<string, unknown>;
export const COOLING_DEEP_DIVE: Record<string, unknown>;
export const CASE_DEEP_DIVE: Record<string, unknown>;
export const SYSTEM_ARCHITECTURE: Record<string, unknown>;

export const explainCPUConcept: (...args: unknown[]) => unknown;
export const getCacheInfo: (...args: unknown[]) => unknown;
export const getOCPotential: (...args: unknown[]) => unknown;
export const getArchitectureInfo: (...args: unknown[]) => unknown;
export const getGPUPSU: (...args: unknown[]) => unknown;
export const compareUpscaling: (...args: unknown[]) => unknown;
export const getChipsetRecommendation: (...args: unknown[]) => unknown;
export const checkVRMAdequacy: (...args: unknown[]) => unknown;
export const explainMoboTerm: (...args: unknown[]) => unknown;
export const calculateTrueLatency: (...args: unknown[]) => unknown;
export const compareRAM: (...args: unknown[]) => unknown;
export const getOptimalRAM: (...args: unknown[]) => unknown;
export const explainRAMTerm: (...args: unknown[]) => unknown;
export const getStorageRecommendation: (...args: unknown[]) => unknown;
export const explainStorageTerm: (...args: unknown[]) => unknown;
export const getPSURecommendation: (...args: unknown[]) => unknown;
export const explainPSUTerm: (...args: unknown[]) => unknown;
export const getCoolerRecommendation: (...args: unknown[]) => unknown;
export const explainCoolingTerm: (...args: unknown[]) => unknown;
export const checkTemperature: (...args: unknown[]) => unknown;
export const checkGPUFit: (...args: unknown[]) => unknown;
export const getCaseRecommendation: (...args: unknown[]) => unknown;
export const explainCaseTerm: (...args: unknown[]) => unknown;
export const analyzeBalance: (...args: unknown[]) => unknown;
export const getRecommendedPairing: (...args: unknown[]) => unknown;
export const explainSystemTerm: (...args: unknown[]) => unknown;

export const getKnowledgeStats: (...args: unknown[]) => {
  totalParts: number;
  byCategory: Record<string, number>;
  byEra: Record<string, number>;
};

declare const _default: {
  ALL_PARTS: Record<string, unknown>;
  ERAS: Record<string, unknown>;
  searchParts: (...args: unknown[]) => unknown;
  formatPartInfo: (...args: unknown[]) => string;
  getKnowledgeStats: (...args: unknown[]) => {
    totalParts: number;
    byCategory: Record<string, number>;
    byEra: Record<string, number>;
  };
  TROUBLESHOOTING: Record<string, TroubleshootingEntry>;
};

export default _default;
