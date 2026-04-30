const fs = require('fs');
const file = 'src/react-app/i18n/locales/es.json';
let text = fs.readFileSync(file, 'utf8');

// Strip all true control characters (0x00 to 0x1F) except whitespace/newlines
let cleaned = '';
for (let i = 0; i < text.length; i++) {
  let c = text.charCodeAt(i);
  if (c < 32 && c !== 10 && c !== 13 && c !== 9) {
    // Ignore control char
  } else {
    cleaned += text[i];
  }
}
text = cleaned;

// The user replaced valid accented characters with the replacement character  (U+FFFD).
text = text.replace(/altimas/g, 'Últimas');
text = text.replace(/anete/g, 'Únete');
text = text.replace(/Compaero/g, 'Compañero');
text = text.replace(/Nios/g, 'Niños');
text = text.replace(/pequeos/g, 'pequeños');
text = text.replace(/teraputicos/g, 'terapéuticos');
text = text.replace(/bsicos/g, 'básicos');
text = text.replace(/configuracin/g, 'configuración');
text = text.replace(/recuperacin/g, 'recuperación');
text = text.replace(/crdito/g, 'crédito');
text = text.replace(/diseado/g, 'diseñado');
text = text.replace(/aqu/g, 'aquí');
text = text.replace(/est/g, 'está');

// And they messed up these specific tags
text = text.replace(/IA   un sistema/g, 'IA — un sistema');
text = text.replace(/tendencias nos/g, 'tendencias—nos');
text = text.replace(/apps estamos/g, 'apps—estamos');
text = text.replace(/Configuración    Correo/g, 'Configuración — Correo');
text = text.replace(/automatización ayudando/g, 'automatización—ayudando');

// Fix the deleted categories logic by running a JSON parse/stringify after modifying
try {
  let data = JSON.parse(text);
  
  // Re-add apps categories
  data.apps.empty_cta = "Contactar al Estudio";
  data.apps.categories = {
    "TOOL": "Herramientas",
    "GAME": "Juegos",
    "AI TOOL": "Herramientas de IA",
    "EDUCATION": "Educación",
    "FINANCE": "Finanzas",
    "HOME": "Hogar",
    "LEARNING": "Aprendizaje",
    "AUTOMATION": "Automatización"
  };
  data.apps.filters = { "all": "Todos" };
  data.apps.status_filters = {
    "all": "Todas las Apps",
    "preview": "Preview",
    "live": "En Vivo",
    "coming_soon": "Próximamente"
  };
  data.apps.featured = {
    "title": "Apps Destacadas",
    "count": "{{count}} productos seleccionados",
    "more": "Más del estudio"
  };
  data.apps.no_description = "Sin descripción disponible";
  data.apps.completion = "Desarrollo";

  // Re-add services features
  data.services.proposal.features = {
    "website": "Sitio Web",
    "mobile": "App Móvil",
    "backend": "Backend",
    "automation": "Automatización"
  };
  data.services.proposal.why_matters = "Por qué es Importante";
  data.services.proposal.timeline_label = "Cronograma";
  data.services.proposal.process_label = "Proceso";

  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log('Successfully reverted user edits, purged bad control chars, and re-injected JSON.');
} catch (e) {
  console.error('Failed to parse JSON:', e);
}
