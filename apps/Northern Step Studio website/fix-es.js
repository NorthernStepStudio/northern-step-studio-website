const fs = require('fs');
const file = 'src/react-app/i18n/locales/es.json';
let text = fs.readFileSync(file, 'utf8');

// Replace the replacement character  (U+FFFD) globally
text = text.replace(/\ufffd/g, '—');

try {
  JSON.parse(text);
  fs.writeFileSync(file, text);
  console.log('Successfully fixed es.json and validated JSON syntax.');
} catch (e) {
  console.error('Failed to parse JSON after fixing:', e);
}
