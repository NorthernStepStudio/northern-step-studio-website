const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '..', 'apps', 'mobile', 'src', 'services', 'mockData.js'), 'utf8');

// Use a more robust regex for the object or just slice it out
let start = content.indexOf('export const MOCK_PARTS = {');
let end = content.lastIndexOf('};');
let jsonStr = content.substring(start + 26, end + 1);

// We need to make it valid JSON to parse it
// Or better, use a regex to extract all parts
const parts = {};
const categoryMatches = content.matchAll(/    (\w+): \[([\s\S]*?)    \],/g);

for (const match of categoryMatches) {
    const category = match[1];
    const itemsStr = match[2];
    
    const items = [];
    const itemMatches = itemsStr.matchAll(/\{([\s\S]*?)\}/g);
    for (const itemMatch of itemMatches) {
        const itemContent = itemMatch[1];
        const item = {};
        
        const idMatch = itemContent.match(/id: ['"](.*?)['"]/);
        const nameMatch = itemContent.match(/name: ['"](.*?)['"]/);
        const manufacturerMatch = itemContent.match(/manufacturer: ['"](.*?)['"]/);
        const priceMatch = itemContent.match(/price: ([\d.]+)/);
        const scoreMatch = itemContent.match(/score: ([\d.]+)/);
        const imageMatch = itemContent.match(/image_url: ['"](.*?)['"]/);
        
        if (nameMatch) item.name = nameMatch[1];
        if (idMatch) item.id = idMatch[1];
        if (manufacturerMatch) item.manufacturer = manufacturerMatch[1];
        if (priceMatch) item.price = parseFloat(priceMatch[1]);
        if (scoreMatch) item.score = parseInt(scoreMatch[1]);
        if (imageMatch) item.image_url = imageMatch[1];
        
        // Extract specs
        const specsMatch = itemContent.match(/specs: \{(.*?)\}/s);
        if (specsMatch) {
            try {
                // Not actually JSON, so we manual parse
                const specEntries = specsMatch[1].split(',').map(s => s.trim());
                item.specs = {};
                specEntries.forEach(entry => {
                    const [k, v] = entry.split(':').map(x => x.trim().replace(/['"]/g, ''));
                    if (k && v) item.specs[k] = v;
                });
            } catch(e) {}
        }
        
        if (Object.keys(item).length > 0) items.push(item);
    }
    parts[category] = items;
}

fs.writeFileSync(path.join(__dirname, 'parts.json'), JSON.stringify(parts, null, 2));
console.log('Successfully saved scratch/parts.json');
