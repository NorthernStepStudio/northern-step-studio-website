import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

export type AppLanguage = "en" | "es";

type TranslationKey =
  | "common.language"
  | "common.english"
  | "common.spanish"
  | "tabs.home"
  | "tabs.learn"
  | "tabs.plan"
  | "tabs.portfolio"
  | "tabs.discovery"
  | "layout.onboarding"
  | "layout.checkin"
  | "layout.lesson"
  | "layout.home"
  | "layout.addEntry"
  | "layout.rules"
  | "layout.market"
  | "layout.orders"
  | "layout.lossSimulator"
  | "layout.healthReport"
  | "layout.notifications"
  | "layout.settings"
  | "screen.footerDisclaimer"
  | "settings.accountTitle"
  | "settings.currentPathStatus"
  | "settings.truthMedals"
  | "settings.decisionTest"
  | "settings.decisionTestSubtitle"
  | "settings.legalDisclosure"
  | "settings.blackSwanLog"
  | "settings.clearLog"
  | "settings.unlockPro"
  | "settings.restorePurchases"
  | "settings.privacyPolicy"
  | "settings.termsOfService"
  | "settings.readRules"
  | "settings.resetAllData"
  | "settings.versionLabel"
  | "settings.languageSection";

type Dictionary = Record<TranslationKey, string>;

const TRANSLATIONS: Record<AppLanguage, Dictionary> = {
  en: {
    "common.language": "Language",
    "common.english": "English",
    "common.spanish": "Spanish",
    "tabs.home": "Home",
    "tabs.learn": "Learn",
    "tabs.plan": "Plan",
    "tabs.portfolio": "Portfolio",
    "tabs.discovery": "Discovery",
    "layout.onboarding": "Onboarding",
    "layout.checkin": "Weekly Check-In",
    "layout.lesson": "Lesson",
    "layout.home": "Home",
    "layout.addEntry": "Add Entry",
    "layout.rules": "NooBS Rules",
    "layout.market": "NooBS Market",
    "layout.orders": "Orders",
    "layout.lossSimulator": "Loss Simulator",
    "layout.healthReport": "AI Health Report",
    "layout.notifications": "Terminal Logs",
    "layout.settings": "Account Settings",
    "screen.footerDisclaimer":
      "NOOBS INVESTING IS AN EDUCATIONAL SIMULATION. NO REAL ASSETS ARE TRADED. NOT FINANCIAL ADVICE.",
    "settings.accountTitle": "Account Settings",
    "settings.currentPathStatus": "Current Path Status",
    "settings.truthMedals": "Truth Medals",
    "settings.decisionTest": "Truth Stress-Test",
    "settings.decisionTestSubtitle":
      "Manually trigger a crash to test your resolve.",
    "settings.legalDisclosure": "Legal Disclosure",
    "settings.blackSwanLog": "Black Swan Event Log",
    "settings.clearLog": "CLEAR LOG",
    "settings.unlockPro": "Unlock NooBS Pro",
    "settings.restorePurchases": "Restore Purchases",
    "settings.privacyPolicy": "Privacy Policy",
    "settings.termsOfService": "Terms of Service",
    "settings.readRules": "Read the NooBS Rules",
    "settings.resetAllData": "RESET ALL DATA",
    "settings.versionLabel": "VERSION 1.0.0",
    "settings.languageSection": "Language"
  },
  es: {
    "common.language": "Idioma",
    "common.english": "Ingles",
    "common.spanish": "Espanol",
    "tabs.home": "Inicio",
    "tabs.learn": "Aprender",
    "tabs.plan": "Plan",
    "tabs.portfolio": "Portafolio",
    "tabs.discovery": "Descubrir",
    "layout.onboarding": "Inicio guiado",
    "layout.checkin": "Chequeo semanal",
    "layout.lesson": "Leccion",
    "layout.home": "Inicio",
    "layout.addEntry": "Agregar entrada",
    "layout.rules": "Reglas NooBS",
    "layout.market": "Mercado NooBS",
    "layout.orders": "Ordenes",
    "layout.lossSimulator": "Simulador de perdidas",
    "layout.healthReport": "Reporte de salud IA",
    "layout.notifications": "Registros",
    "layout.settings": "Configuracion de cuenta",
    "screen.footerDisclaimer":
      "NOOBS INVESTING ES UNA SIMULACION EDUCATIVA. NO SE OPERAN ACTIVOS REALES. NO ES ASESORIA FINANCIERA.",
    "settings.accountTitle": "Configuracion de cuenta",
    "settings.currentPathStatus": "Estado actual del camino",
    "settings.truthMedals": "Medallas de verdad",
    "settings.decisionTest": "Prueba de estres",
    "settings.decisionTestSubtitle":
      "Dispara una caida para probar tu disciplina.",
    "settings.legalDisclosure": "Aviso legal",
    "settings.blackSwanLog": "Registro de cisnes negros",
    "settings.clearLog": "BORRAR REGISTRO",
    "settings.unlockPro": "Desbloquear NooBS Pro",
    "settings.restorePurchases": "Restaurar compras",
    "settings.privacyPolicy": "Politica de privacidad",
    "settings.termsOfService": "Terminos de servicio",
    "settings.readRules": "Leer reglas NooBS",
    "settings.resetAllData": "REINICIAR TODO",
    "settings.versionLabel": "VERSION 1.0.0",
    "settings.languageSection": "Idioma"
  }
};

const LITERAL_ES: Record<string, string> = {
  Success: "Exito",
  "No Purchase Found": "Compra no encontrada",
  "Your Pro status has been restored.": "Tu estado Pro fue restaurado.",
  "We couldn't find any previous Pro purchases for this account.":
    "No encontramos compras Pro anteriores para esta cuenta.",
  "No major shocks recorded yet. The market is eerily calm...":
    "Aun no hay shocks registrados. El mercado esta inquietantemente calmado...",
  "Welcome to the Elite":
    "Bienvenido a la elite",
  "You now have full access to all Pro features.":
    "Ahora tienes acceso completo a todas las funciones Pro.",
  "Reset all data?": "Reiniciar todos los datos?",
  "This deletes everything. Yes, even your fake money glory.":
    "Esto elimina todo. Si, incluso tu gloria de dinero falso.",
  Cancel: "Cancelar",
  Reset: "Reiniciar",
  "Link to: ": "Enlace a: ",
  "\n\n(In production, this would open the browser)":
    "\n\n(En produccion, esto abriria el navegador)",
  "educational simulation": "simulacion educativa",
  "Stored locally. No accounts. Just progress.":
    "Guardado localmente. Sin cuentas. Solo progreso.",
  "Discover the path": "Descubrir el camino",
  "DISCOVER THE PATH": "DESCUBRE EL CAMINO",
  "This would open your web browser to: ":
    "Esto abriria tu navegador en: ",
  "Truth Check Required": "Chequeo de verdad requerido",
  "You must acknowledge that this is a simulation before entering.":
    "Debes confirmar que esto es una simulacion antes de entrar.",
  "PATH PROGRESS": "PROGRESO DEL CAMINO",
  To: "Hacia",
  "Core Residency": "Residencia central",
  "Income Harvesting": "Cosecha de ingresos",
  "Requirement:": "Requisito:",
  Mission: "Mision",
  "Discipline beats intelligence. Stop checking prices. Follow the path. Build boring wealth.":
    "La disciplina vence a la inteligencia. Deja de revisar precios. Sigue el camino. Construye riqueza aburrida.",
  "Current Focus": "Enfoque actual",
  "Market Reality": "Realidad del mercado",
  "The NooBS Way": "La via NooBS",
  "We do not do \"hot tips.\" We do ":
    "Aqui no hacemos 'tips calientes'. Hacemos ",
  "Process.": "Proceso.",
  " Learn the rules, set your plan, practice with paper money, and then execute for real. It is boring. It is slow. It works.":
    " Aprende las reglas, define tu plan, practica con dinero de prueba y luego ejecuta en real. Es aburrido. Es lento. Funciona.",
  "The Path": "El camino",
  "Build your brain power.": "Fortalece tu criterio.",
  "Automate your strategy.": "Automatiza tu estrategia.",
  "Track your empire.": "Sigue tu imperio.",
  "Translate the jargon.": "Traduce la jerga.",
  "NooBS Investing is an educational simulation. No real money is involved. This is not professional financial advice.":
    "NooBS Investing es una simulacion educativa. No hay dinero real involucrado. Esto no es asesoria financiera profesional.",
  "Welcome to the reality check.":
    "Bienvenido al chequeo de realidad.",
  "Stability first.": "Primero estabilidad.",
  "Build a cushion before you build a portfolio.":
    "Crea un colchon antes de construir un portafolio.",
  "High-interest debt is a black hole. Close it first.":
    "La deuda de alto interes es un agujero negro. Cierrala primero.",
  "You are falling behind.": "Te estas quedando atras.",
  Plan: "Plan",
  Actual: "Real",
  "Stop making excuses, start making trades.":
    "Deja las excusas y empieza a ejecutar.",
  "Your plan is drifting.": "Tu plan se esta desviando.",
  "You are no longer matching your target strategy. It is time to rebalance.":
    "Ya no estas alineado con tu estrategia objetivo. Es hora de rebalancear.",
  "Graduate Task: Simulator sandbox.":
    "Tarea final: laboratorio del simulador.",
  "Class is over. Add your first 3 paper entries to see how the market actually 'drifts.' Theory ends here.":
    "La teoria termino. Agrega tus primeras 3 entradas en papel para ver como se mueve el mercado de verdad.",
  "Weekly check-in.": "Chequeo semanal.",
  "Did you follow the plan... or vibes?":
    "Seguiste el plan... o tus impulsos?",
  "Steady as she goes.":
    "Constancia ante todo.",
  "Decision Support": "Soporte de decision",
  "Check your discipline.": "Revisa tu disciplina.",
  "We're not stopping you, we're just making sure you're not being impulsive. Answer honestly.":
    "No te estamos deteniendo; solo verificamos que no estes actuando por impulso. Responde con honestidad.",
  "This is NOT FOMO or hype.":
    "Esto NO es FOMO ni hype.",
  "I have an emergency fund.":
    "Tengo fondo de emergencia.",
  "I plan to hold this for 1Y+.":
    "Planeo mantener esto por 1 ano o mas.",
  "Investing is slow. If you want fast, go to a casino.":
    "Invertir es lento. Si quieres rapido, ve a un casino.",
  "WAIT, NEVER MIND":
    "ESPERA, MEJOR NO",
  "SAVE ENTRY": "GUARDAR ENTRADA",
  Learn: "Aprender",
  Portfolio: "Portafolio",
  Encyclopedia: "Enciclopedia",
  "Educational Disclaimer": "Aviso educativo",
  "Calculating next move...": "Calculando tu siguiente movimiento...",
  "Purchase Unavailable": "Compra no disponible",
  "Live billing is not configured yet for this build. Please try again later.":
    "La facturacion en vivo aun no esta configurada para esta version. Intenta de nuevo mas tarde.",
  "Restore Failed": "Restauracion fallida",
  "We couldn't find any active Pro subscriptions on this account.":
    "No encontramos suscripciones Pro activas en esta cuenta.",
  "Terminal Logs": "Registros del sistema",
  CLEAR: "BORRAR",
  "No system logs found.": "No se encontraron registros del sistema.",
  "Truth Nudges and market events will appear here as they trigger.":
    "Los avisos de verdad y eventos de mercado apareceran aqui cuando ocurran.",
  "Growth: The Early Wins": "Crecimiento: victorias tempranas",
  "Your Cash": "Tu efectivo",
  "Market Bonus": "Bono del mercado",
  "\"Every dollar you put in now is a soldier working for you later. Even after 1 year, you're ahead of where you started.\"":
    "\"Cada dolar que inviertes hoy es un soldado trabajando para ti manana. Incluso despues de 1 ano, ya vas por delante de donde empezaste.\"",
  "Live Market Sim": "Simulacion de mercado en vivo",
  "(Demo)": "(Demostracion)",
  "TODAY (ACCELERATED)": "HOY (ACELERADO)",
  "Hall Locked": "Sala bloqueada",
  "You haven't earned entry to": "Aun no has ganado entrada a",
  "yet. Meet the requirements to unlock.":
    "todavia. Cumple los requisitos para desbloquear.",
  DONE: "HECHO",
  Truth: "Verdad",
  Warning: "Advertencia",
  Info: "Info"
};

const STORAGE_KEY = "noobs-investing:language";
export const LANGUAGE_SELECTION_STORAGE_KEY = "noobs-investing:language-selected";
let currentLanguage: AppLanguage = "en";

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const preserveCase = (source: string, translated: string): string => {
  if (!source) {
    return translated;
  }
  if (source.toUpperCase() === source) {
    return translated.toUpperCase();
  }
  if (
    source[0] === source[0].toUpperCase() &&
    source.slice(1) === source.slice(1).toLowerCase()
  ) {
    return translated[0]?.toUpperCase() + translated.slice(1);
  }
  return translated;
};

const WORD_REPLACEMENTS_ES: Record<string, string> = {
  account: "cuenta",
  activity: "actividad",
  add: "agregar",
  advanced: "avanzado",
  all: "todo",
  amount: "monto",
  analytics: "analitica",
  annual: "anual",
  asset: "activo",
  back: "atras",
  buy: "comprar",
  cancel: "cancelar",
  cash: "efectivo",
  check: "chequeo",
  clear: "borrar",
  close: "cerrar",
  confirm: "confirmar",
  current: "actual",
  dashboard: "panel",
  data: "datos",
  debt: "deuda",
  default: "predeterminado",
  deposit: "depositar",
  discovery: "descubrir",
  discipline: "disciplina",
  earnings: "ganancias",
  emergency: "emergencia",
  entry: "entrada",
  expenses: "gastos",
  fee: "comision",
  fees: "comisiones",
  fund: "fondo",
  goal: "objetivo",
  growth: "crecimiento",
  home: "inicio",
  income: "ingreso",
  index: "indice",
  invest: "invertir",
  investment: "inversion",
  language: "idioma",
  learn: "aprender",
  lesson: "leccion",
  market: "mercado",
  monthly: "mensual",
  next: "siguiente",
  notifications: "notificaciones",
  onboarding: "inicio guiado",
  order: "orden",
  orders: "ordenes",
  path: "camino",
  performance: "rendimiento",
  plan: "plan",
  portfolio: "portafolio",
  price: "precio",
  pro: "pro",
  progress: "progreso",
  purchases: "compras",
  real: "real",
  rebalance: "rebalancear",
  report: "reporte",
  reset: "reiniciar",
  restore: "restaurar",
  risk: "riesgo",
  rules: "reglas",
  save: "guardar",
  scan: "escaneo",
  score: "puntaje",
  settings: "configuracion",
  shares: "acciones",
  simulator: "simulador",
  stability: "estabilidad",
  status: "estado",
  stress: "estres",
  summary: "resumen",
  terms: "terminos",
  timeline: "cronograma",
  total: "total",
  trade: "operacion",
  training: "entrenamiento",
  unlock: "desbloquear",
  update: "actualizar",
  value: "valor",
  weekly: "semanal",
  yield: "rendimiento"
};

const shouldSkipAutoTranslation = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }
  if (/https?:\/\//i.test(trimmed)) {
    return true;
  }
  if (/@/.test(trimmed)) {
    return true;
  }
  if (/^[A-Z0-9_./:%+-]{2,}$/.test(trimmed)) {
    return true;
  }
  return false;
};

const autoTranslateSpanish = (value: string): string => {
  if (shouldSkipAutoTranslation(value)) {
    return value;
  }

  const phraseEntries = Object.entries(LITERAL_ES).sort(
    (left, right) => right[0].length - left[0].length
  );
  let result = value;
  for (const [english, spanish] of phraseEntries) {
    const regex = new RegExp(escapeRegex(english), "gi");
    result = result.replace(regex, (match) => preserveCase(match, spanish));
  }

  if (result !== value) {
    return result;
  }

  return value.replace(/\b[A-Za-z][A-Za-z'/-]*\b/g, (word) => {
    const key = word.toLowerCase();
    const translated = WORD_REPLACEMENTS_ES[key];
    if (!translated) {
      return word;
    }
    return preserveCase(word, translated);
  });
};

const inferLanguageFromDevice = (): AppLanguage => {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase();
    return locale.startsWith("es") ? "es" : "en";
  } catch {
    return "en";
  }
};

const tFromLanguage = (language: AppLanguage, key: TranslationKey): string =>
  TRANSLATIONS[language]?.[key] ?? TRANSLATIONS.en[key];

const trFromLanguage = (language: AppLanguage, value: string): string => {
  if (language !== "es") {
    return value;
  }
  return LITERAL_ES[value] ?? autoTranslateSpanish(value);
};

interface I18nContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: TranslationKey) => string;
  tr: (value: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  language: "en",
  setLanguage: () => undefined,
  t: (key) => tFromLanguage("en", key),
  tr: (value) => value
});

export const getCurrentLanguage = (): AppLanguage => currentLanguage;
export const setCurrentLanguage = (language: AppLanguage): void => {
  currentLanguage = language;
};

export const getTranslator = (language: AppLanguage) => ({
  t: (key: TranslationKey) => tFromLanguage(language, key),
  tr: (value: string) => trFromLanguage(language, value)
});

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<AppLanguage>(inferLanguageFromDevice);

  useEffect(() => {
    setCurrentLanguage(language);
  }, [language]);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === "en" || stored === "es") {
          setLanguageState(stored);
          setCurrentLanguage(stored);
        }
      } catch {
        // Ignore storage issues and keep default language.
      }
    };
    void hydrate();
  }, []);

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    setCurrentLanguage(nextLanguage);
    void AsyncStorage.setItem(STORAGE_KEY, nextLanguage).catch(() => undefined);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key) => tFromLanguage(language, key),
      tr: (text) => trFromLanguage(language, text)
    }),
    [language, setLanguage]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);
