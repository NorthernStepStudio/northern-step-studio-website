/**
 * Consolidated PC Parts Database
 */

export interface PartSpec {
  id: number;
  name: string;
  category: string;
  brand: string;
  price: number;
  specs: Record<string, string | number | boolean>;
  releaseYear: number;
  rating?: number;
  popularity?: number;
}

export const ALL_PARTS: PartSpec[] = [
  // CPUs
  {
    id: 12001,
    name: "AMD Ryzen 7 9800X3D",
    category: "CPU",
    brand: "AMD",
    price: 479,
    releaseYear: 2024,
    rating: 5.0,
    popularity: 99,
    specs: { cores: 8, threads: 16, socket: "AM5", ddr: "DDR5" },
  },
  {
    id: 1010,
    name: "AMD Ryzen 7 7800X3D",
    category: "CPU",
    brand: "AMD",
    price: 449,
    releaseYear: 2023,
    rating: 4.9,
    popularity: 98,
    specs: { cores: 8, threads: 16, socket: "AM5", ddr: "DDR5" },
  },
  {
    id: 1105,
    name: "Intel Core i7-14700K",
    category: "CPU",
    brand: "Intel",
    price: 409,
    releaseYear: 2023,
    rating: 4.8,
    popularity: 92,
    specs: { cores: 20, threads: 28, socket: "LGA1700", ddr: "DDR5" },
  },
  {
    id: 1129,
    name: "Intel Core i5-12400F",
    category: "CPU",
    brand: "Intel",
    price: 119,
    releaseYear: 2022,
    rating: 4.8,
    popularity: 90,
    specs: { cores: 6, threads: 12, socket: "LGA1700", ddr: "DDR4/DDR5" },
  },
  {
    id: 1024,
    name: "AMD Ryzen 5 5600",
    category: "CPU",
    brand: "AMD",
    price: 119,
    releaseYear: 2022,
    rating: 4.7,
    popularity: 92,
    specs: { cores: 6, threads: 12, socket: "AM4", ddr: "DDR4" },
  },

  // GPUs
  {
    id: 2010,
    name: "NVIDIA GeForce RTX 4090",
    category: "GPU",
    brand: "NVIDIA",
    price: 1599,
    releaseYear: 2022,
    rating: 4.9,
    popularity: 95,
    specs: { vram: "24GB" },
  },
  {
    id: 12203,
    name: "NVIDIA GeForce RTX 4070 Super",
    category: "GPU",
    brand: "NVIDIA",
    price: 599,
    releaseYear: 2024,
    rating: 4.9,
    popularity: 98,
    specs: { vram: "12GB" },
  },
  {
    id: 2113,
    name: "AMD Radeon RX 7800 XT",
    category: "GPU",
    brand: "AMD",
    price: 449,
    releaseYear: 2023,
    rating: 4.7,
    popularity: 92,
    specs: { vram: "16GB" },
  },
  {
    id: 2020,
    name: "NVIDIA GeForce RTX 4060",
    category: "GPU",
    brand: "NVIDIA",
    price: 299,
    releaseYear: 2023,
    rating: 4.6,
    popularity: 90,
    specs: { vram: "8GB" },
  },
  {
    id: 2116,
    name: "AMD Radeon RX 7600",
    category: "GPU",
    brand: "AMD",
    price: 249,
    releaseYear: 2023,
    rating: 4.5,
    popularity: 85,
    specs: { vram: "8GB" },
  },

  // Motherboards
  {
    id: 4006,
    name: "MSI MAG B650 Tomahawk WiFi",
    category: "Motherboard",
    brand: "MSI",
    price: 239,
    releaseYear: 2022,
    rating: 4.6,
    popularity: 92,
    specs: { socket: "AM5", memory: "DDR5" },
  },
  {
    id: 4110,
    name: "MSI MAG B760 Tomahawk WiFi",
    category: "Motherboard",
    brand: "MSI",
    price: 189,
    releaseYear: 2023,
    rating: 4.6,
    popularity: 90,
    specs: { socket: "LGA1700", memory: "DDR5" },
  },
  {
    id: 4204,
    name: "MSI MAG B550 Tomahawk",
    category: "Motherboard",
    brand: "MSI",
    price: 169,
    releaseYear: 2020,
    rating: 4.7,
    popularity: 95,
    specs: { socket: "AM4", memory: "DDR4" },
  },

  // RAM
  {
    id: 3001,
    name: "G.Skill Trident Z5 RGB 32GB DDR5-6000",
    category: "RAM",
    brand: "G.Skill",
    price: 139,
    releaseYear: 2023,
    rating: 4.8,
    popularity: 95,
    specs: { type: "DDR5" },
  },
  {
    id: 3103,
    name: "Corsair Vengeance LPX 32GB DDR4-3200",
    category: "RAM",
    brand: "Corsair",
    price: 54,
    releaseYear: 2020,
    rating: 4.7,
    popularity: 98,
    specs: { type: "DDR4" },
  },

  // Storage
  {
    id: 5001,
    name: "Samsung 980 Pro 1TB",
    category: "Storage",
    brand: "Samsung",
    price: 99,
    releaseYear: 2021,
    rating: 4.9,
    popularity: 96,
    specs: { type: "NVMe" },
  },

  // PSUs
  {
    id: 6001,
    name: "Corsair RM750e (2023)",
    category: "PSU",
    brand: "Corsair",
    price: 99,
    releaseYear: 2023,
    rating: 4.8,
    popularity: 94,
    specs: { wattage: 750 },
  },

  // Cases
  {
    id: 12401,
    name: "NZXT H6 Flow RGB",
    category: "Case",
    brand: "NZXT",
    price: 134,
    releaseYear: 2024,
    rating: 4.8,
    popularity: 98,
    specs: { formFactor: "ATX" },
  },
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
  // Simplified budget builder for the worker
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
  let remainingBudget = budget;

  const normalizedUseCase = String(useCase || "gaming").toLowerCase();
  const allocationKey = normalizedUseCase.includes("stream")
    ? "streaming"
    : normalizedUseCase.includes("work")
      ? "work"
      : "gaming";

  // Fixed allocation for simplicity in the worker version
  const allocationsByUseCase: Record<string, Record<string, number>> = {
    gaming: {
      CPU: 0.22,
      GPU: 0.43,
      Motherboard: 0.12,
      RAM: 0.08,
      Storage: 0.08,
      PSU: 0.05,
      Case: 0.02,
    },
    streaming: {
      CPU: 0.28,
      GPU: 0.35,
      Motherboard: 0.12,
      RAM: 0.12,
      Storage: 0.08,
      PSU: 0.03,
      Case: 0.02,
    },
    work: {
      CPU: 0.35,
      GPU: 0.22,
      Motherboard: 0.12,
      RAM: 0.15,
      Storage: 0.1,
      PSU: 0.03,
      Case: 0.03,
    },
  };
  const allocations =
    allocationsByUseCase[allocationKey] || allocationsByUseCase.gaming;

  for (const cat of categories) {
    const catParts = getPartsByCategory(cat);
    const targetPrice = budget * allocations[cat];
    const bestMatch =
      catParts
        .filter((p) => p.price <= targetPrice * 1.2)
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))[0] ||
      catParts.sort((a, b) => a.price - b.price)[0];

    if (bestMatch) build.push(bestMatch);
  }

  return build;
}
