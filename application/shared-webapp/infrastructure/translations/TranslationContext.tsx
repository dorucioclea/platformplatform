import { createContext } from "react";

import type { Locale, LocaleInfo } from "./Translation";

export type { Locale, LocaleInfo } from "./Translation";

export type SetLocalFunction = (locale: Locale) => Promise<void>;

export type TranslationContext = {
  currentLocale: Locale;
  setLocale: SetLocalFunction;
  locales: Locale[];
  getLocaleInfo(locale: Locale): LocaleInfo;
};

export const translationContext = createContext<TranslationContext>({
  currentLocale: (typeof document !== "undefined" ? (document.documentElement.lang as Locale) : "en-US") as Locale,
  setLocale: async (locale) => {
    document.dispatchEvent(new CustomEvent("locale-change-request", { detail: { locale } }));
  },
  locales: [],
  getLocaleInfo: () => {
    throw new Error("Not initialized.");
  }
});
