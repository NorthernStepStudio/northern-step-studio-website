import fs from 'fs';

const filePath = 'd:/dev/Northern Step Studio/apps/Northern Step Studio website/src/react-app/i18n/locales/es.json';
let content = fs.readFileSync(filePath, 'utf8');

// Advanced replacements for mixed up encodings and double-encoding issues
const replacements = [
    // Double letters from wrong splits
    [/áá/g, 'á'],
    [/éé/g, 'é'],
    [/íí/g, 'í'],
    [/óó/g, 'ó'],
    [/úú/g, 'ú'],
    
    // Remaining UTF-8 artifacts
    [/Áš/g, 'Ú'],
    [/áš/g, 'ú'],
    [/Áº/g, 'º'],
    [/Â©/g, '©'],
    [/Á³/g, 'ó'],
    [/Á­/g, 'í'],
    [/Á¡/g, 'á'],
    [/Á©/g, 'é'],
    [/Á±/g, 'ñ'],
    [/Áš/g, 'Ú'],
    
    // Specific studio/app misspellings (Portuguese/typo mix)
    [/estáudio/g, 'estudio'],
    [/estáudio/g, 'estudio'],
    [/nuestáro/g, 'nuestro'],
    [/nuestára/g, 'nuestra'],
    [/nuestáros/g, 'nuestros'],
    [/nuestáras/g, 'nuestras'],
    [/investáigaci/g, 'investigaci'],
    [/investáing/g, 'investing'],
    [/presupuestáos/g, 'presupuestos'],
    [/propuestáas/g, 'propuestas'],
    [/milestáones/g, 'hitos'],
    [/respuestáa/g, 'respuesta'],
    [/respuestáas/g, 'respuestas'],
    
    // Generic fixes
    [/estáán/g, 'están'],
    [/aquíí/g, 'aquí'],
    [/Ã¡/g, 'á'],
    [/Ã©/g, 'é'],
    [/Ã­/g, 'í'],
    [/Ã³/g, 'ó'],
    [/Ãº/g, 'ú'],
    [/Ã±/g, 'ñ'],
    [/Ãš/g, 'Ú'],
    [/Ã /g, 'á'], // Sometimes Ã followed by space is á
    
    // Clean up any remaining odd sequences
    [/Á\s/g, 'á'],
    [/Áš/g, 'ú']
];

replacements.forEach(([regex, replacement]) => {
    content = content.replace(regex, replacement);
});

// Final check for the word "studio" vs "estudio" in Spanish
content = content.replace(/estáudio/g, 'estudio');
content = content.replace(/estudio/g, 'estudio'); // ensure no accents on 'u' or 'i' unless needed

// "Próximamente" check
content = content.replace(/Próximamente/g, 'Próximamente');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Sanitized es.json again');
