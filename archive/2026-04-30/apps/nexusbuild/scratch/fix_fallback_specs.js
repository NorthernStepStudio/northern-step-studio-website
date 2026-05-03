const fs = require('fs');

const mockDataPath = 'd:/dev/Northern Step Studio/apps/nexusbuild/apps/mobile/src/services/mockData.js';
const fallbackWorkerPath = 'd:/dev/Northern Step Studio/apps/nexusbuild/apps/backend-worker/src/services/fallbackCatalog.ts';
const fallbackBackendPath = 'd:/dev/Northern Step Studio/apps/nexusbuild/apps/backend/src/services/fallbackCatalog.ts';

const content = fs.readFileSync(mockDataPath, 'utf8');

const categoryMap = {
    cpu: 'CPU',
    gpu: 'VIDEO_CARD',
    motherboard: 'MOTHERBOARD',
    ram: 'MEMORY',
    storage: 'INTERNAL_HARD_DRIVE',
    psu: 'POWER_SUPPLY',
    case: 'CASE',
    cooler: 'CPU_COOLER',
    monitor: 'MONITOR'
};

const allExtractedParts = [];

// Very simple line-by-lineish parsing
const partBlocks = content.split('id:');
for (let i = 1; i < partBlocks.length; i++) {
    const block = 'id:' + partBlocks[i];
    const id = (block.match(/id:\s*['"](.+?)['"]/) || [])[1];
    const name = (block.match(/name:\s*['"](.+?)['"]/) || [])[1];
    const price = (block.match(/price:\s*([\d.]+)/) || [])[1];
    const score = (block.match(/score:\s*([\d.]+)/) || [])[1];
    const specsMatch = block.match(/specs:\s*(\{[\s\S]+?\})/);
    const categoryMatch = (block.match(/category:\s*['"](.+?)['"]/) || [])[1];
    
    const pcppCat = categoryMap[categoryMatch];

    if (id && name && price && specsMatch && pcppCat) {
        allExtractedParts.push({
            id,
            name,
            price: parseFloat(price),
            score: score ? parseFloat(score) : null,
            specsStr: specsMatch[1].replace(/\s+/g, ' '),
            category: pcppCat
        });
    }
}

console.log(`Extracted ${allExtractedParts.length} parts with specs.`);

const generateSeedStr = (parts) => {
    return parts.map(p => {
        return `  {
    id: ${JSON.stringify(p.id)},
    name: ${JSON.stringify(p.name)},
    category: PCPP_CATEGORIES.${p.category},
    price: ${p.price},
    merchant: "NexusBuild",
    url: "https://nexusbuild.app",
    specs: ${p.specsStr},
    ratingStars: 4.8,
    ratingCount: 150,
    image_url: null,
    score: ${p.score},
  },`;
    }).join('\n');
};

const seedContent = generateSeedStr(allExtractedParts);

const updateFile = (filePath) => {
    let target = fs.readFileSync(filePath, 'utf8');
    const startMarker = 'const FALLBACK_SEEDS: FallbackSeed[] = [';
    const endMarker = '];\n\nconst FALLBACK_PRODUCTS = FALLBACK_SEEDS.map(createFallbackProduct);';
    
    const startIndex = target.indexOf(startMarker);
    const endIndex = target.indexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) {
        console.error(`Markers not found in ${filePath}`);
        return;
    }
    
    const newFileContent = target.slice(0, startIndex + startMarker.length) + '\n' + seedContent + '\n' + target.slice(endIndex);
    fs.writeFileSync(filePath, newFileContent);
    console.log(`Updated ${filePath}`);
};

updateFile(fallbackWorkerPath);
updateFile(fallbackBackendPath);
