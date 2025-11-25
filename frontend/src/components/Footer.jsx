import { Link } from "react-router-dom";
import { FaInstagram, FaTwitter, FaTiktok, FaYoutube, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-gray-300 pt-16 pb-8 font-sans mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Grid Layout: 5 Kolonlu Yapı (Geniş Ekran) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* 1. KOLON: Marka & Sosyal Medya */}
          <div className="lg:col-span-2">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-4 inline-block hover:opacity-80 transition">
              🌸 ÇiçekSepeti UK
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-sm">
              Londra'nın en taze çiçeklerini ve en özel hediyelerini sevdiklerinize aynı gün ulaştırıyoruz. Mutluluk dağıtıyoruz.
            </p>
            
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

          {/* 2. KOLON: Hızlı Erişim */}
          <div>
            <h3 className="text-white font-bold mb-4 text-lg border-b border-slate-700 pb-2 inline-block">Kurumsal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-pink-500 transition">› Hakkımızda</Link></li>
              {/* SSS Sayfası (Henüz yapmadık ama linki hazır olsun) */}
              <li><Link to="/faq" className="hover:text-pink-500 transition">› Sıkça Sorulan Sorular</Link></li>
              <li><Link to="/contact" className="hover:text-pink-500 transition">› İletişim / Destek</Link></li>
              {/* Giriş/Kayıt linklerini buradan kaldırdık (Zaten Navbar'da var) */}
              <li><a href="#" className="hover:text-pink-500 transition">› Kariyer</a></li>
              <li><a href="#" className="hover:text-pink-500 transition">› Blog</a></li>
            </ul>
          </div>

          {/* 3. KOLON: İş Ortaklığı (YENİ) */}
          <div>
            <h3 className="text-white font-bold mb-4 text-lg border-b border-slate-700 pb-2 inline-block">İş Ortaklığı</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/become-seller" className="hover:text-pink-500 transition flex items-center gap-2 group">
                  <span className="text-lg group-hover:scale-110 transition">🏪</span> Satıcı Ol
                </Link>
              </li>
              <li>
                <Link to="/become-courier" className="hover:text-blue-400 transition flex items-center gap-2 group">
                  <span className="text-lg group-hover:scale-110 transition">🛵</span> Kurye Ol
                </Link>
              </li>
              <li className="pt-2 text-xs text-gray-500 leading-tight">
                Ekibimize katılın, kendi işinizin patronu olun.
              </li>
            </ul>
          </div>

          {/* 4. KOLON: İletişim */}
          <div>
            <h3 className="text-white font-bold mb-4 text-lg border-b border-slate-700 pb-2 inline-block">Bize Ulaşın</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 group">
                <div className="mt-1 text-pink-500 group-hover:text-white transition"><FaMapMarkerAlt /></div>
                <span className="leading-relaxed text-gray-400 group-hover:text-gray-300">
                  123 Oxford Street,<br/>
                  London, W1D 1BS,<br/>
                  United Kingdom
                </span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="text-pink-500 group-hover:text-white transition"><FaPhone /></div>
                <span className="text-gray-400 group-hover:text-gray-300">+44 20 7946 0000</span>
              </li>
              <li><Link to="/contact" className="hover:text-pink-500 transition flex items-center gap-1">› İletişim</Link></li>
              <li className="flex items-center gap-3 group">
                <div className="text-pink-500 group-hover:text-white transition"><FaEnvelope /></div>
                <a href="mailto:destek@ciceksepeti.uk" className="text-gray-400 hover:text-white transition">destek@ciceksepeti.uk</a>
              </li>
            </ul>
          </div>

        </div>

        {/* --- ALT ÇİZGİ & TELİF --- */}
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