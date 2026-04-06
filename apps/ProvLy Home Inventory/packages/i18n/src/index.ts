import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import es from "./es.json";

type InitOptions = {
  language?: string;
};

export const resources = {
  en: { translation: en },
  es: { translation: es },
};

export function initI18n(options: InitOptions = {}) {
  const { language } = options;

  if (i18n.isInitialized) {
    if (language && i18n.language !== language) {
      void i18n.changeLanguage(language);
    }
    return i18n;
  }

  i18n.use(initReactI18next).init({
    resources,
    lng: language ?? "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

  return i18n;
}

export { i18n };
