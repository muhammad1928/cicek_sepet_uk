import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-gray-300 pt-16 pb-8 font-sans mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* 1. Kolon: Marka */}
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-4">
              🌸 ÇiçekSepeti UK
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Londra'nın en taze çiçeklerini ve en özel hediyelerini sevdiklerinize aynı gün ulaştırıyoruz. Mutluluk dağıtıyoruz.
            </p>
            {/* Sosyal Medya (Temsili) */}
            <div className="flex gap-4">
              {["instagram", "twitter", "facebook"].map(social => (
                <div key={social} className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition cursor-pointer">
                  <span className="text-xs capitalize">{social[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Kolon: Hızlı Linkler */}
          <div>
            <h3 className="text-white font-bold mb-4">Hızlı Erişim</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-pink-500 transition">Ana Sayfa</Link></li>
              <li><Link to="/register" className="hover:text-pink-500 transition">Kayıt Ol</Link></li>
              <li><Link to="/login" className="hover:text-pink-500 transition">Giriş Yap</Link></li>
              <li><Link to="/my-orders" className="hover:text-pink-500 transition">Sipariş Takibi</Link></li>
            </ul>
          </div>

          {/* 3. Kolon: Kategoriler */}
          <div>
            <h3 className="text-white font-bold mb-4">Popüler Kategoriler</h3>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-pink-500 cursor-pointer transition">Doğum Günü Çiçekleri</li>
              <li className="hover:text-pink-500 cursor-pointer transition">Yıldönümü Hediyeleri</li>
              <li className="hover:text-pink-500 cursor-pointer transition">Yenilebilir Çiçek</li>
              <li className="hover:text-pink-500 cursor-pointer transition">İç Mekan Bitkileri</li>
            </ul>
          </div>

          {/* 4. Kolon: İletişim */}
          <div>
            <h3 className="text-white font-bold mb-4">İletişim</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span>📍</span>
                <span>123 Oxford Street, London,<br/>W1D 1BS, United Kingdom</span>
              </li>
              <li className="flex items-center gap-3">
                <span>📞</span>
                <span>+44 20 7946 0000</span>
              </li>
              <li className="flex items-center gap-3">
                <span>✉️</span>
                <span>destek@ciceksepeti.uk</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Alt Çizgi ve Telif */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} ÇiçekSepeti UK. Tüm hakları saklıdır.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span className="hover:text-white cursor-pointer">Gizlilik Politikası</span>
            <span className="hover:text-white cursor-pointer">Mesafeli Satış Sözleşmesi</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;