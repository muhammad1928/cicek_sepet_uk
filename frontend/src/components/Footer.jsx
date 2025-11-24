import { Link } from "react-router-dom";
import { FaInstagram, FaTwitter, FaTiktok, FaYoutube, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-gray-300 pt-16 pb-8 font-sans mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* 1. Kolon: Marka & Sosyal Medya */}
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-4">
              🌸 ÇiçekSepeti UK
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Londra'nın en taze çiçeklerini ve en özel hediyelerini sevdiklerinize aynı gün ulaştırıyoruz. Mutluluk dağıtıyoruz.
            </p>
            
            {/* Sosyal Medya İkonları */}
            <div className="flex gap-3">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-pink-600 text-white transition text-lg shadow-lg hover:shadow-pink-500/30">
                <FaInstagram />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-blue-400 text-white transition text-lg shadow-lg hover:shadow-blue-400/30">
                <FaTwitter />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-black text-white transition text-lg shadow-lg hover:shadow-gray-500/30 border border-slate-700 hover:border-black">
                <FaTiktok />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-red-600 text-white transition text-lg shadow-lg hover:shadow-red-600/30">
                <FaYoutube />
              </a>
            </div>
          </div>

          {/* 2. Kolon: Hızlı Linkler */}
          <div>
            <h3 className="text-white font-bold mb-4 text-lg">Hızlı Erişim</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="hover:text-pink-500 transition flex items-center gap-2">
                  <span>›</span> Ana Sayfa
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-pink-500 transition flex items-center gap-2">
                  <span>›</span> Hakkımızda
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-pink-500 transition flex items-center gap-2">
                  <span>›</span> Kayıt Ol
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-pink-500 transition flex items-center gap-2">
                  <span>›</span> Giriş Yap
                </Link>
              </li>
              <li>
                <Link to="/my-orders" className="hover:text-pink-500 transition flex items-center gap-2">
                  <span>›</span> Sipariş Takibi
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Kolon: Kategoriler */}
          <div>
            <h3 className="text-white font-bold mb-4 text-lg">Popüler Kategoriler</h3>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-pink-500 cursor-pointer transition flex items-center gap-2">
                <span>•</span> Doğum Günü Çiçekleri
              </li>
              <li className="hover:text-pink-500 cursor-pointer transition flex items-center gap-2">
                <span>•</span> Yıldönümü Hediyeleri
              </li>
              <li className="hover:text-pink-500 cursor-pointer transition flex items-center gap-2">
                <span>•</span> Yenilebilir Çiçek
              </li>
              <li className="hover:text-pink-500 cursor-pointer transition flex items-center gap-2">
                <span>•</span> İç Mekan Bitkileri
              </li>
              <li className="hover:text-pink-500 cursor-pointer transition flex items-center gap-2">
                <span>•</span> Tasarım Çiçekler
              </li>
            </ul>
          </div>

          {/* 4. Kolon: İletişim */}
          <div>
            <h3 className="text-white font-bold mb-4 text-lg">İletişim</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 group">
                <div className="mt-1 text-pink-500 group-hover:scale-110 transition"><FaMapMarkerAlt /></div>
                <span className="leading-relaxed">
                  123 Oxford Street,<br/>
                  London, W1D 1BS,<br/>
                  United Kingdom
                </span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="text-pink-500 group-hover:scale-110 transition"><FaPhone /></div>
                <span>+44 20 7946 0000</span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="text-pink-500 group-hover:scale-110 transition"><FaEnvelope /></div>
                <a href="mailto:destek@ciceksepeti.uk" className="hover:text-white transition">destek@ciceksepeti.uk</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Alt Çizgi ve Telif */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <p>&copy; {new Date().getFullYear()} ÇiçekSepeti UK. Tüm hakları saklıdır.</p>
          
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer transition">Gizlilik Politikası</span>
            <span className="hover:text-white cursor-pointer transition">Mesafeli Satış Sözleşmesi</span>
            <span className="hover:text-white cursor-pointer transition">Çerez Politikası</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;