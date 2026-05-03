import fs from 'fs';
import path from 'path';

const filePath = 'd:/dev/Northern Step Studio/apps/Northern Step Studio website/src/react-app/i18n/locales/es.json';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix UTF-8 encoding issues (common patterns)
const encodingMap = {
    'Ã¡': 'á',
    'Ã©': 'é',
    'Ã­': 'í',
    'Ã³': 'ó',
    'Ãº': 'ú',
    'Ã±': 'ñ',
    'Ã': 'Á',
    'Ã‰': 'É',
    'Ã\u008d': 'Í', // Ã
    'Ã“': 'Ó',
    'Ãš': 'Ú',
    'Ã‘': 'Ñ',
    'Â¿': '¿',
    'Â¡': '¡',
    'Â©': '©',
    'Ã\u00ada': 'ía', // Special case for some sequences
    'Ã­­': 'í',
    'Ã¡Ã¡': 'á',
    'ï¿½': '—'
};

for (const [key, value] of Object.entries(encodingMap)) {
    content = content.split(key).join(value);
}

// 2. Fix specific spelling errors (Portuguese-style or typos)
const spellingFixes = {
    'estáudio': 'estudio',
    'estudio': 'estudio', // ensure no 'á'
    'nuestáro': 'nuestro',
    'nuestára': 'nuestra',
    'nuestáros': 'nuestros',
    'nuestáras': 'nuestras',
    'investáigaci': 'investigaci',
    'investáing': 'investing',
    'presupuestáos': 'presupuestos',
    'propuestáas': 'propuestas',
    'estáÃ¡n': 'están',
    'aquÃ­Ã­': 'aquí',
    'respuestáa': 'respuesta',
    'respuestáas': 'respuestas',
    'estáÃ¡': 'está',
    'terapÃ©utico': 'terapéutico',
    'milestáones': 'hitos'
};

for (const [key, value] of Object.entries(spellingFixes)) {
    content = content.split(key).join(value);
}

// Additional manual cleanup for things like "estáudio" appearing with various encodings
content = content.replace(/est[á|a]udio/g, 'estudio');
content = content.replace(/nuestr[o|a]s?/g, (match) => match.replace('á', ''));

fs.writeFileSync(filePath, content, 'utf8');
console.log('Sanitized es.json');
