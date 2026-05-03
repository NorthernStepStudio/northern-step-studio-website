import * as fs from 'fs';

const partsJson = fs.readFileSync('scratch/all_parts.json', 'utf8');
const workerPartsPath = 'apps/backend-worker/src/data/parts.ts';
let workerPartsContent = fs.readFileSync(workerPartsPath, 'utf8');

// Use regex to replace the ALL_PARTS array
// It starts with 'export const ALL_PARTS: PartSpec[] = [' and ends with '];' before the next export function
const startTag = 'export const ALL_PARTS: PartSpec[] = [';
const endTag = '];\n\nexport function getPartsByCategory';

const startIndex = workerPartsContent.indexOf(startTag);
const endIndex = workerPartsContent.indexOf(endTag);

if (startIndex !== -1 && endIndex !== -1) {
    const newContent = workerPartsContent.slice(0, startIndex + startTag.length) + 
                       '\n' + partsJson.slice(1, -1) + '\n' +
                       workerPartsContent.slice(endIndex);
    
    fs.writeFileSync(workerPartsPath, newContent);
    console.log('Worker parts.ts updated successfully.');
} else {
    console.error('Could not find tags in worker parts.ts');
}
