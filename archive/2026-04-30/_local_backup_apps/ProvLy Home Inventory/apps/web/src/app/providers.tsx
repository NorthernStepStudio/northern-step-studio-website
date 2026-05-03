"use client";

import { initI18n, i18n } from "@homevault/i18n";
import { I18nextProvider } from "react-i18next";

const language =
  typeof navigator !== "undefined"
    ? navigator.language.split("-")[0]
    : "en";

initI18n({ language });

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
