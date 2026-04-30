import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import es from "./locales/es.json";
import it from "./locales/it.json";

type TranslationTree = Record<string, unknown>;
const SUPPORTED_LANGUAGES = new Set(["en", "es", "it"]);

function isPlainObject(value: unknown): value is TranslationTree {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeWithFallback(base: TranslationTree, overrides: TranslationTree): TranslationTree {
  const merged: TranslationTree = { ...base };

  for (const [key, value] of Object.entries(overrides)) {
    const currentBase = merged[key];
    if (isPlainObject(currentBase) && isPlainObject(value)) {
      merged[key] = mergeWithFallback(currentBase, value);
      continue;
    }

    merged[key] = value;
  }

  return merged;
}

const savedLanguage = typeof window !== "undefined" 
  ? localStorage.getItem("language") || "en" 
  : "en";
const resolvedLanguage = SUPPORTED_LANGUAGES.has(savedLanguage) ? savedLanguage : "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: mergeWithFallback(en as TranslationTree, es as TranslationTree) },
    it: { translation: mergeWithFallback(en as TranslationTree, it as TranslationTree) },
  },
  lng: resolvedLanguage,
  fallbackLng: "en",
  returnNull: false,
  returnEmptyString: false,
  parseMissingKeyHandler: () => "",
  missingKeyHandler: (languages, namespace, key) => {
    console.error("[i18n] Missing translation key", {
      key,
      namespace,
      languages,
    });
  },
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
