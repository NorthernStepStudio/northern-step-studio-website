const fs = require('fs');
const file = 'src/react-app/i18n/locales/es.json';
let text = fs.readFileSync(file, 'utf8');

// The error is at position 14916. Let's see characters around it.
console.log('Pos 14900 to 14930:');
for (let i = 14900; i < 14930; i++) {
  console.log(`[${i}] ${text[i]} (code: ${text.charCodeAt(i)})`);
}

// Remove all control characters (0x00 to 0x1F) except newline, carriage return, and tab.
let cleaned = '';
for (let i = 0; i < text.length; i++) {
  let c = text.charCodeAt(i);
  if (c < 32 && c !== 10 && c !== 13 && c !== 9) {
    console.log(`Found bad control char at ${i}: code ${c}`);
  } else {
    cleaned += text[i];
  }
}

try {
  JSON.parse(cleaned);
  fs.writeFileSync(file, cleaned);
  console.log('Successfully fixed es.json and validated JSON syntax.');
} catch (e) {
  console.error('Failed to parse JSON after cleaning:', e);
}
