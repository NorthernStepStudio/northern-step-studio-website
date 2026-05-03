import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import en from "./en.json";
import es from "./es.json";
import it from "./it.json";

const resources = {
  en: { translation: en },
  es: { translation: es },
  it: { translation: it }
} as const;

const deviceLang = (Localization.getLocales()?.[0]?.languageCode ?? "en") as
  | "en"
  | "es"
  | "it";

i18n.use(initReactI18next).init({
  resources,
  lng: ["en", "es", "it"].includes(deviceLang) ? deviceLang : "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  returnNull: false,
  compatibilityJSON: 'v3'
});

export default i18n;
