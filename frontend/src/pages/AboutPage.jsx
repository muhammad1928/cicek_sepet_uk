import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Seo title="Hakkımızda" description="ÇiçekSepeti UK hikayesi ve vizyonu." />
      
      {/* İçerik Navbar'ın altında kalsın diye pt-24 */}
      <div className="flex-1 pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
          
          {/* Banner Resim */}
          <div className="h-64 bg-cover bg-center relative" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1527061011665-3652c757a4d4?q=80&w=1000&auto=format&fit=crop')" }}>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Bizim Hikayemiz</h1>
            </div>
          </div>

          <div className="p-8 md:p-12 space-y-8">
            
            {/* Misyon */}
            <section>
              <h2 className="text-2xl font-bold text-pink-600 mb-4">Mutluluk Dağıtıyoruz</h2>
              <p className="text-gray-600 leading-relaxed">
                2024 yılında Londra'da kurulan ÇiçekSepeti UK, sevdiklerinize en taze çiçekleri ve en özel hediyeleri ulaştırmak için yola çıktı. 
                Amacımız sadece bir ürün teslim etmek değil, mesafeleri kısaltıp duygularınızı en güzel haliyle ifade etmenize yardımcı olmaktır.
              </p>
            </section>

            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-4 bg-pink-50 rounded-xl">
                <div className="text-3xl mb-2">🚚</div>
                <h3 className="font-bold text-gray-800">Aynı Gün Teslimat</h3>
                <p className="text-xs text-gray-500 mt-1">Londra içi 18:00'a kadar verilen siparişlerde.</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <div className="text-3xl mb-2">💐</div>
                <h3 className="font-bold text-gray-800">Tazelik Garantisi</h3>
                <p className="text-xs text-gray-500 mt-1">Her sabah mezattan seçilen en taze çiçekler.</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="text-3xl mb-2">💳</div>
                <h3 className="font-bold text-gray-800">Güvenli Ödeme</h3>
                <p className="text-xs text-gray-500 mt-1">Stripe altyapısı ile %100 güvenli alışveriş.</p>
              </div>
            </div>

            {/* Vizyon */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Neden Biz?</h2>
              <p className="text-gray-600 leading-relaxed">
                Global tecrübemizi yerel dokunuşlarla birleştiriyoruz. Hem yerel çiçekçileri destekliyor hem de kurumsal bir hizmet kalitesi sunuyoruz. 
                Kurye ekibimiz, çiçeklerinizi sarsmadan, özenle ve güler yüzle teslim eder.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;