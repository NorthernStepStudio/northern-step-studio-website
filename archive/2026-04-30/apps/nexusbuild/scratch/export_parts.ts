import { ALL_PARTS } from 'd:/dev/Northern Step Studio/apps/nexusbuild/apps/backend/src/data/index';
import * as fs from 'fs';

const mappedParts = ALL_PARTS.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    brand: p.brand,
    price: p.price,
    score: (p as any).rating || 0,
    popularity: (p as any).popularity || 0,
    specs: p.specs
}));

fs.writeFileSync('scratch/all_parts.json', JSON.stringify(mappedParts, null, 2));
console.log('Export complete.');
