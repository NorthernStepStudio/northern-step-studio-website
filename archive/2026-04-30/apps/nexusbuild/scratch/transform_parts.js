const fs = require('fs');
const path = require('path');

const parts = JSON.parse(fs.readFileSync(path.join(__dirname, 'parts.json'), 'utf8'));

const CATEGORY_MAP = {
    'cpu': 'cpu',
    'gpu': 'video-card',
    'motherboard': 'motherboard',
    'ram': 'memory',
    'internal-hard-drive': 'internal-hard-drive',
    'storage': 'internal-hard-drive',
    'psu': 'power-supply',
    'power-supply': 'power-supply',
    'case': 'case',
    'cooler': 'cpu-cooler',
    'cpu-cooler': 'cpu-cooler',
    'monitor': 'monitor',
    'keyboard': 'keyboard',
    'mouse': 'mouse',
    'headset': 'headphones',
    'headphones': 'headphones',
};

const transformed = [];

for (const [cat, items] of Object.entries(parts)) {
    const pcppCat = CATEGORY_MAP[cat];
    if (!pcppCat) continue;

    items.slice(0, 20).forEach(item => {
        transformed.push({
            id: item.id || `mock-${cat}-${Math.random().toString(36).substr(2, 9)}`,
            name: item.name,
            category: pcppCat,
            price: item.price || 0,
            merchant: item.manufacturer || 'NexusBuild',
            url: item.url || 'https://nexusbuild.app',
            specs: item.specs || {},
            ratingStars: item.ratingStars || 4.5,
            ratingCount: item.ratingCount || 100,
            image_url: item.image_url || null,
            score: item.score || null
        });
    });
}

fs.writeFileSync(path.join(__dirname, 'seeds.json'), JSON.stringify(transformed, null, 2));
console.log('Successfully saved scratch/seeds.json');
