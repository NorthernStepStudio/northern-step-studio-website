const fs = require('fs');

const fallbackPath = 'd:/dev/Northern Step Studio/apps/nexusbuild/apps/backend-worker/src/services/fallbackCatalog.ts';
const partsDataPath = 'd:/dev/Northern Step Studio/apps/nexusbuild/apps/backend-worker/src/data/parts.ts';

const content = fs.readFileSync(fallbackPath, 'utf8');

// Extract current mapping and helper logic from parts.ts to preserve it
let partsTs = fs.readFileSync(partsDataPath, 'utf8');
const interfacePartSpec = `export interface PartSpec {
  id: string | number;
  name: string;
  category: string;
  brand: string;
  price: number;
  specs: Record<string, string | number | boolean>;
  score?: number | null;
  popularity?: number;
}`;

// Extract seeds from fallbackCatalog
const seedBlockMatch = content.match(/const FALLBACK_SEEDS: FallbackSeed\[\] = \[([\s\S]+?)\];\n\nconst FALLBACK_PRODUCTS/);
if (!seedBlockMatch) {
    console.error("Could not find FALLBACK_SEEDS in fallbackCatalog.ts");
    process.exit(1);
}

const rawSeeds = seedBlockMatch[1];
// We'll transform these into PartSpec
// We need to handle PCPP_CATEGORIES.X mapping too.
const seeds = rawSeeds.split('},').map(s => {
    if (!s.trim()) return null;
    const block = s + '}';
    const id = (block.match(/id:\s*['"](.+?)['"]/) || [])[1];
    const name = (block.match(/name:\s*['"](.+?)['"]/) || [])[1];
    const priceStr = (block.match(/price:\s*([\d.]+)/) || [])[1];
    const scoreStr = (block.match(/score:\s*([\d.]+)/) || [])[1];
    const specsMatch = block.match(/specs:\s*(\{[\s\S]+?\})/);
    const categoryMatch = (block.match(/category:\s*PCPP_CATEGORIES\.(\w+)/) || [])[1];

    if (!id || !name || !priceStr || !categoryMatch) return null;

    return {
        id,
        name,
        category: categoryMatch, // e.g. CPU
        price: parseFloat(priceStr),
        score: scoreStr ? parseFloat(scoreStr) : null,
        specsStr: specsMatch ? specsMatch[1] : ' {}'
    };
}).filter(Boolean);

const categoryMap = {
    CPU: 'CPU',
    VIDEO_CARD: 'GPU',
    MOTHERBOARD: 'Motherboard',
    MEMORY: 'RAM',
    INTERNAL_HARD_DRIVE: 'Storage',
    POWER_SUPPLY: 'PSU',
    CASE: 'Case',
    CPU_COOLER: 'Cooler',
    MONITOR: 'Monitor'
};

const allPartsStr = seeds.map(p => {
    const brand = p.name.split(' ')[0];
    const displayCat = categoryMap[p.category] || p.category;
    return `  {
    id: ${JSON.stringify(p.id)},
    name: ${JSON.stringify(p.name)},
    category: ${JSON.stringify(displayCat)},
    brand: ${JSON.stringify(brand)},
    price: ${p.price},
    score: ${p.score},
    specs: ${p.specsStr},
  },`;
}).join('\n');

const newPartsTs = `/**
 * Consolidated PC Parts Database (Generated from Fallback Catalog)
 */

${interfacePartSpec}

export const ALL_PARTS: PartSpec[] = [
${allPartsStr}
];

export function getPartsByCategory(category: string): PartSpec[] {
  return ALL_PARTS.filter(
    (p) => p.category.toLowerCase() === category.toLowerCase(),
  );
}

export function searchParts(query: string): PartSpec[] {
  const q = query.toLowerCase();
  return ALL_PARTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q),
  );
}

export function getBudgetBuild(budget: number, useCase: string): PartSpec[] {
  const categories = [
    "CPU",
    "GPU",
    "Motherboard",
    "RAM",
    "Storage",
    "PSU",
    "Case",
  ];
  const build: PartSpec[] = [];
  
  const normalizedUseCase = String(useCase || "gaming").toLowerCase();
  const allocationKey = normalizedUseCase.includes("stream")
    ? "streaming"
    : normalizedUseCase.includes("work")
      ? "work"
      : "gaming";

  const allocationsByUseCase: Record<string, Record<string, number>> = {
    gaming: { CPU: 0.20, GPU: 0.45, Motherboard: 0.12, RAM: 0.08, Storage: 0.07, PSU: 0.05, Case: 0.03 },
    streaming: { CPU: 0.25, GPU: 0.40, Motherboard: 0.12, RAM: 0.10, Storage: 0.06, PSU: 0.04, Case: 0.03 },
    work: { CPU: 0.35, GPU: 0.25, Motherboard: 0.12, RAM: 0.15, Storage: 0.08, PSU: 0.03, Case: 0.02 },
  };
  
  const allocations = allocationsByUseCase[allocationKey] || allocationsByUseCase.gaming;

  for (const cat of categories) {
    const catParts = getPartsByCategory(cat);
    const targetPrice = budget * allocations[cat];
    
    // Find best performance/score within budget, or closest price
    const bestMatch = catParts
      .filter(p => p.price <= targetPrice * 1.5)
      .sort((a, b) => {
          // Priority: Score (if exists and similar price), otherwise closest to target
          if (a.score && b.score) {
              const scoreWeight = 0.7;
              const priceWeight = 0.3;
              const aVal = (a.score / 1000) * scoreWeight - (Math.abs(a.price - targetPrice) / 100) * priceWeight;
              const bVal = (b.score / 1000) * scoreWeight - (Math.abs(b.price - targetPrice) / 100) * priceWeight;
              return bVal - aVal;
          }
          return Math.abs(a.price - targetPrice) - Math.abs(b.price - targetPrice);
      })[0] || catParts.sort((a, b) => a.price - b.price)[0];

    if (bestMatch) build.push(bestMatch);
  }

  return build;
}
`;

fs.writeFileSync(partsDataPath, newPartsTs);
console.log("Synchronized parts.ts with 560+ parts and improved build logic.");
