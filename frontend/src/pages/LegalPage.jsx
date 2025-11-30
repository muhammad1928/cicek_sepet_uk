import { useParams, Link } from "react-router-dom";
import Seo from "../components/Seo";
import { FiFileText, FiShield, FiAlertCircle } from "react-icons/fi";

const LegalPage = () => {
  const { type } = useParams(); // url'den 'privacy-policy', 'terms-of-use', 'cookie-policy' alır

  const content = {
    // 1. GİZLİLİK POLİTİKASI
    "privacy-policy": {
      title: "Gizlilik ve Veri Güvenliği Politikası",
      icon: <FiShield />,
      body: (
        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-2">1. Veri Sorumlusu</h3>
            <p>ÇiçekSepeti UK olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve Avrupa Genel Veri Koruma Tüzüğü (GDPR) kapsamında kişisel verilerinizin güvenliğine maksimum önem veriyoruz.</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-2">2. Toplanan Veriler ve Amaçları</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Kimlik ve İletişim:</strong> Ad, soyad, e-posta ve telefon numaranız; sipariş onayı ve fatura işlemleri için işlenir.</li>
              <li><strong>Teslimat Bilgisi:</strong> Alıcının adresi ve iletişim bilgileri, siparişin teslimi amacıyla <strong>Kurye</strong> ve ilgili <strong>Mağaza (Satıcı)</strong> ile paylaşılır.</li>
              <li><strong>İşlem Güvenliği:</strong> IP adresi ve cihaz bilgileri, dolandırıcılık tespiti ve yasal yükümlülükler için saklanır.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-2">3. Ödeme Güvenliği</h3>
            <p>Kredi kartı bilgileriniz sunucularımızda <u>asla saklanmaz</u>. Ödeme işlemleri, SSL sertifikalı şifreli bağlantı üzerinden doğrudan global ödeme altyapısı <strong>Stripe</strong> tarafından gerçekleştirilir.</p>
          </section>
        </div>
      )
    },

    // 2. MESAFELİ SATIŞ SÖZLEŞMESİ
    "terms-of-use": {
      title: "Mesafeli Satış Sözleşmesi",
      icon: <FiFileText />,
      body: (
        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-2">1. Taraflar</h3>
            <p>İşbu sözleşme, platform üzerinden sipariş veren ALICI ile ürünü tedarik eden SATICI (Mağaza) arasında, ÇiçekSepeti UK arabuluculuğunda akdedilmiştir.</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-2">2. Cayma Hakkı İstisnası (Önemli)</h3>
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-sm text-yellow-800 flex gap-3">
               <FiAlertCircle className="text-xl shrink-0 mt-0.5" />
               <div>
                 <strong>DİKKAT:</strong> Yönetmelik gereği; "Çabuk bozulabilen veya son kullanma tarihi geçebilecek malların teslimine ilişkin sözleşmelerde" (Canlı Çiçek, Çikolata, Pasta vb.) <strong>CAYMA HAKKI KULLANILAMAZ.</strong>
               </div>
            </div>
            <p className="mt-3">Ancak ürün; teslimat anında hasarlı, solmuş veya görselden tamamen farklı ise, alıcı teslimatı kabul etmeyerek iade talep edebilir.</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-2">3. Teslimat Süreci</h3>
            <p>Siparişler, alıcının seçtiği tarih ve saat aralığında teslim edilir. Mücbir sebepler (hava muhalefeti, trafik kazası vb.) dışında gecikmelerden platform sorumludur.</p>
          </section>
        </div>
      )
    },

    // 3. ÇEREZ POLİTİKASI (GÜNCELLENMİŞ)
    "cookie-policy": {
      title: "Çerez (Cookie) Politikası",
      icon: <span className="text-2xl">🍪</span>,
      body: (
        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-2">1. Çerez Nedir?</h3>
            <p>Çerezler, ziyaret ettiğiniz web siteleri tarafından tarayıcınıza kaydedilen ve sizi hatırlamamıza yarayan küçük metin dosyalarıdır. Sitemizin çalışması için bazı çerezler zorunludur.</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-2">2. Hangi Çerezleri Kullanıyoruz?</h3>
            <div className="grid gap-4">
               <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-pink-600 text-sm uppercase mb-1">Zorunlu Çerezler</h4>
                  <p className="text-xs">Sepetinizdeki ürünleri hatırlamak, hesabınıza giriş yapabilmeniz ve ödeme güvenliği için gereklidir. Bunlar kapatılamaz.</p>
               </div>
               <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-blue-600 text-sm uppercase mb-1">İşlevsel Çerezler</h4>
                  <p className="text-xs">Dil tercihleriniz, adres kayıtlarınız ve "Beni Hatırla" gibi özellikler için kullanılır.</p>
               </div>
               <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-purple-600 text-sm uppercase mb-1">Analitik Çerezler</h4>
                  <p className="text-xs">Sitemizi nasıl kullandığınızı (hangi sayfalara baktığınızı) anonim olarak analiz ederek hizmetimizi geliştirmemize yardımcı olur.</p>
               </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-800 mb-2">3. Çerezleri Nasıl Yönetirim?</h3>
            <p>Tarayıcınızın ayarlar menüsünden çerezleri dilediğiniz zaman silebilir veya engelleyebilirsiniz. Ancak zorunlu çerezleri engellemek, sepet ve ödeme fonksiyonlarının çalışmasını bozabilir.</p>
          </section>
        </div>
      )
    }
  };

  const data = content[type] || { title: "Sayfa Bulunamadı", body: "Aradığınız içerik mevcut değil.", icon: <FiAlertCircle /> };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-10 pb-20 px-4">
      <Seo title={data.title} description={`${data.title} hakkında detaylı bilgi.`} />
      
      <div className="max-w-4xl mx-auto">
        
        {/* Başlık Kartı */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 mb-8 flex items-center gap-6">
           <div className="w-16 h-16 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
              {data.icon}
           </div>
           <div>
              <h1 className="text-3xl font-black text-gray-800">{data.title}</h1>
              <p className="text-gray-500 text-sm mt-1">Son Güncelleme: {new Date().toLocaleDateString()}</p>
           </div>
        </div>

        {/* İçerik Alanı */}
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-200 text-gray-600 leading-relaxed text-sm">
          {typeof data.body === 'string' ? <p>{data.body}</p> : data.body}

          <div className="mt-10 pt-10 border-t border-gray-100 flex justify-between items-center">
             <Link to="/" className="text-gray-500 font-bold hover:text-black transition">← Ana Sayfaya Dön</Link>
             <p className="text-xs text-gray-400">&copy; ÇiçekSepeti UK Legal Team</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LegalPage;