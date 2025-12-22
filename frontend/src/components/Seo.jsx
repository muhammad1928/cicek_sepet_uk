import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const Seo = ({ title, description, keywords, image, noindex }) => {
  const { i18n } = useTranslation();
  
  // Eğer dil seçili değilse varsayılan 'en' olsun
  const currentLangCode = i18n.language || 'en';

  // Google'a özel Dil-Bölge Eşleştirmesi
  const localeMap = {
    en: "en-GB", // İngiltere hedefli
    tr: "tr-TR",
    sv: "sv-SE",
    de: "de-DE",
    fr: "fr-FR",
    es: "es-ES",
    it: "it-IT",
    nl: "nl-NL"
  };

  // Mevcut dilin uzun halini al
  const currentLocale = localeMap[currentLangCode] || "en-GB";
  
// UPPDATERAD DEL: Webbplatstitel och Standardbeskrivning
  const siteTitle = "Fesfu UK | Flowers, Fashion, Books & Food";
  
  // Om en produkt saknar beskrivning visas denna allmänna text:
  const defaultDesc = "Order fresh flowers, stylish clothes, and gourmet food online, entertaining books, gift cards. Fesfu offers fast delivery in London for all your gift and lifestyle needs.";
  
  // DÜZELTME: URL'den soru işareti ve sonrasını (?ref=...) temizliyoruz.
  // Sadece temiz domain ve yol bilgisini alıyoruz.
  const currentUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}` 
    : '';

  return (
    <Helmet>
      {/* 1. HTML Lang Özelliği (Dinamik) */}
      <html lang={currentLocale} />

      <title>{title ? `${title} | ${siteTitle}` : siteTitle}</title>
      <meta name="description" content={description || defaultDesc} />
      <meta name="keywords" content={keywords || "flowers, books, gift cards, electronics, tech, fashion, food delivery, london, gift, fesfu"} />
      <meta name="author" content="Fesfu UK" />
      
      {/* Canonical URL (Artık Temiz) */}
      <link rel="canonical" href={currentUrl} />

      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Open Graph Locale */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content={currentLocale.replace('-', '_')} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title || siteTitle} />
      <meta property="og:description" content={description || defaultDesc} />
      {image && <meta property="og:image" content={image} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || siteTitle} />
      <meta name="twitter:description" content={description || defaultDesc} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
};

export default Seo;