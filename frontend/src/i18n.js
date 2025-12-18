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

// JSON dosyalarini guncellediginde bu surum numarasini degistir.
// Bu islem, tarayicinin eski onbellegi silip yeni metinleri almasini zorlar.
const APP_VERSION = "1.0.3"; 

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
    // lng: "en", // BU SATIR KAPATILDI: Açık kalırsa dil algılayıcı çalışmaz, hep İngilizce açılır.
    fallbackLng: "en", // Dil bulunamazsa veya algılanamazsa İngilizceye dön
    debug: false, // Konsol kirliliğini önlemek için false (Geliştirme aşamasında true yapabilirsin)
    interpolation: {
      escapeValue: false // React zaten XSS koruması sağlar
    },
    // Algılayıcı ayarları (Opsiyonel ama önerilir)
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'], // Seçilen dili hafızada tut
    }
  });

// Versiyon bilgisini konsola basarak build'in yenilendiğinden emin olabilirsin
console.log(`App Version: ${APP_VERSION}`);

export default i18n;