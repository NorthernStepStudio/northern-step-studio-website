import fs from 'fs';

const filePath = 'd:/dev/Northern Step Studio/apps/Northern Step Studio website/src/react-app/i18n/locales/es.json';
let content = fs.readFileSync(filePath, 'utf8');

// Fixing specific typos in the about section
content = content.replace(/Nuestáro/g, 'Nuestro');
content = content.replace(/Nuestára/g, 'Nuestra');
content = content.replace(/Nuestáros/g, 'Nuestros');
content = content.replace(/estáamos/g, 'estamos');
content = content.replace(/estáan/g, 'están');
content = content.replace(/Nuestáras/g, 'Nuestras');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed Spanish typos in about section');
