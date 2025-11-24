import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import TermsModal from "../components/TermsModal";
import { useCart } from "../context/CartContext";
import Seo from "../components/Seo";

const RegisterCourierPage = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "", role: "courier" });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { notify } = useCart();

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) return notify("Kurye sözleşmesini onaylamalısınız!", "warning");
    
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/register", formData);
      notify("Başvuru Başarılı! 🛵 Aramıza hoşgeldin.", "success");
      setTimeout(() => { navigate("/login"); }, 2000);
    } catch (err) {
      setLoading(false);
      notify(err.response?.data?.message || "Kayıt başarısız!", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-700 p-4 font-sans relative overflow-hidden">
      <Seo title="Kurye Ol" description="ÇiçekSepeti UK kurye ekibine katılın." />
      
      <div className="bg-white w-full max-w-md p-10 rounded-3xl shadow-2xl relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-full bg-blue-100 text-blue-600 mb-4 text-3xl">🛵</div>
          <h2 className="text-3xl font-extrabold text-gray-800 mb-1">Kuryemiz Olun</h2>
          <p className="text-gray-500 text-sm">Kendi işinin patronu ol, teslim ettikçe kazan.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ad Soyad</label>
            <input name="username" type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500" placeholder="Adınız" onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-Posta</label>
            <input name="email" type="email" className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500" placeholder="mail@kurye.com" onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Şifre</label>
            <input name="password" type="password" className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-blue-500" placeholder="••••••••" onChange={handleChange} required />
          </div>

          <div className="flex items-start gap-3 pt-2 px-1">
            <input type="checkbox" id="terms" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-1 w-5 h-5 accent-blue-600 cursor-pointer" />
            <label htmlFor="terms" className="text-sm text-gray-600 select-none cursor-pointer">
              <span className="text-blue-600 font-bold hover:underline mr-1" onClick={(e) => { e.preventDefault(); setShowTerms(true); }}>Kurye İş Ortaklığı Sözleşmesini</span>
              okudum ve kabul ediyorum.
            </label>
          </div>

          <button type="submit" disabled={loading} className={`w-full text-white font-bold py-4 rounded-xl transition shadow-lg flex justify-center items-center gap-2 text-lg ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700 active:scale-95"}`}>
            {loading ? "İşleniyor..." : "Başvuruyu Tamamla"}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <Link to="/" className="hover:text-blue-600">← Ana Sayfaya Dön</Link>
        </div>
      </div>

      {/* Modal type="courier" */}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} type="courier" />}
    </div>
  );
};

export default RegisterCourierPage;