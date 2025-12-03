import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import tr from "./locales/tr.json";
import en from "./locales/en.json";
import sv from "./locales/sv.json";
import de from "./locales/de.json";
import fr from "./locales/fr.json";
import es from "./locales/es.json";
import it from "./locales/it.json";
import nl from "./locales/nl.json";

i18n
  .use(LanguageDetector) // Tarayıcı dilini algıla
  .use(initReactI18next) // React'e bağla
  .init({
    resources: {
      en: { translation: en },
      tr: { translation: tr },
      sv: { translation: sv },
      de: { translation: de },
      fr: { translation: fr },
      es: { translation: es },
      it: { translation: it },
      nl: { translation: nl },
    },
    lng: "en", // Varsayılan dil (İngiltere için 'en' yapalım)
    fallbackLng: "en", // Dil bulunamazsa İngilizceye dön
    interpolation: {
      escapeValue: false // React zaten XSS koruması sağlar
    }
  });

export default i18n;