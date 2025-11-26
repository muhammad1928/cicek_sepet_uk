import { useParams } from "react-router-dom";
import Seo from "../components/Seo";

const LegalPage = () => {
  const { type } = useParams(); // url'den 'privacy', 'terms', 'cookies' bilgisini al

  const content = {
    "privacy-policy": {
      title: "Gizlilik Politikası",
      text: `
        1. VERİ SORUMLUSU
        ÇiçekSepeti UK olarak kişisel verilerinizin güvenliğine önem veriyoruz...
        
        2. HANGİ VERİLERİ TOPLUYORUZ?
        Ad, soyad, adres, telefon ve e-posta adresiniz sipariş teslimi için toplanmaktadır.
        
        3. VERİ GÜVENLİĞİ
        Kredi kartı bilgileriniz sistemimizde saklanmaz, doğrudan Stripe altyapısı ile işlenir.
      `
    },
    "terms-of-use": {
      title: "Mesafeli Satış Sözleşmesi",
      text: `
        1. TARAFLAR
        Satıcı: ÇiçekSepeti UK
        Alıcı: Müşteri
        
        2. KONU
        İşbu sözleşmenin konusu, alıcının satıcıya ait internet sitesinden sipariş verdiği ürünün satışı ve teslimidir.
        
        3. CAYMA HAKKI
        Canlı çiçek ürünlerinde cayma hakkı, ürün solmadan ve teslimat anında kullanılmalıdır.
      `
    },
    "cookie-policy": {
      title: "Çerez (Cookie) Politikası",
      text: `
        1. ÇEREZ NEDİR?
        Sitemizi daha verimli kullanabilmeniz için bilgisayarınızda saklanan küçük metin dosyalarıdır.
        
        2. HANGİ ÇEREZLERİ KULLANIYORUZ?
        - Zorunlu Çerezler (Sepet işlemleri için)
        - Analitik Çerezler (Ziyaretçi sayısını ölçmek için)
      `
    }
  };

  const data = content[type] || { title: "Sayfa Bulunamadı", text: "İçerik mevcut değil." };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-24 pb-12 px-4">
      <Seo title={data.title} description={`${data.title} detayları.`} />
      
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">{data.title}</h1>
        <div className="text-gray-600 leading-relaxed whitespace-pre-line font-light text-sm">
          {data.text}
          
          {/* Temsili Uzun Metin */}
          <br/><br/>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </div>
      </div>
    </div>
  );
};

export default LegalPage;