import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PartnerApplicationPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState("loading"); // loading, form, pending, approved

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) { navigate("/login"); return; }
    setUser(storedUser);

    // Durum kontrolü
    if (storedUser.applicationStatus === 'approved') {
      navigate(storedUser.role === 'vendor' ? '/vendor' : '/courier');
    } else if (storedUser.applicationStatus === 'pending') {
      setStatus("pending");
    } else {
      setStatus("form");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/users/${user._id}/apply`, formData);
      
      // LocalStorage'ı güncelle
      const updatedUser = { ...user, applicationStatus: 'pending' };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setStatus("pending");
    } catch (err) { alert("Hata oluştu"); }
  };

  if (status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Onay Bekleniyor</h2>
          <p className="text-gray-600">Başvurunuz yöneticilerimiz tarafından incelenmektedir. Onaylandığında panele erişebileceksiniz.</p>
          <button onClick={() => {localStorage.removeItem("user"); navigate("/");}} className="mt-6 text-pink-600 font-bold hover:underline">Çıkış Yap</button>
        </div>
      </div>
    );
  }

  if (status === "form" && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans pt-20">
        <div className="bg-white w-full max-w-lg p-8 rounded-3xl shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {user.role === 'vendor' ? '🏪 Mağaza Bilgileri' : '🛵 Kurye Bilgileri'}
          </h2>
          <p className="text-gray-500 text-sm mb-6">Sistemi kullanabilmek için lütfen aşağıdaki bilgileri eksiksiz doldurun.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* --- KURYE FORMU --- */}
            {user.role === 'courier' && (
              <>
                <input name="phone" placeholder="Cep Telefonu" onChange={handleChange} className="w-full p-3 border rounded" required />
                <select name="vehicleType" onChange={handleChange} className="w-full p-3 border rounded bg-white">
                  <option value="">Araç Tipi Seçiniz...</option>
                  <option value="motor">Motosiklet</option>
                  <option value="car">Otomobil</option>
                  <option value="van">Ticari Araç (Doblo vb.)</option>
                </select>
                <input name="plateNumber" placeholder="Plaka No" onChange={handleChange} className="w-full p-3 border rounded" required />
                <input name="licenseNumber" placeholder="Ehliyet / TC Kimlik No" onChange={handleChange} className="w-full p-3 border rounded" required />
              </>
            )}

            {/* --- SATICI FORMU --- */}
            {user.role === 'vendor' && (
              <>
                <input name="companyName" placeholder="Resmi Şirket Adı" onChange={handleChange} className="w-full p-3 border rounded" required />
                <input name="taxNumber" placeholder="Vergi Numarası" onChange={handleChange} className="w-full p-3 border rounded" required />
                <input name="iban" placeholder="IBAN (TR...)" onChange={handleChange} className="w-full p-3 border rounded" required />
                <textarea name="address" placeholder="Mağaza / Depo Adresi" onChange={handleChange} className="w-full p-3 border rounded h-24" required />
                <input name="phone" placeholder="İletişim Telefonu" onChange={handleChange} className="w-full p-3 border rounded" required />
              </>
            )}

            <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition">Başvuruyu Gönder</button>
          </form>
        </div>
      </div>
    );
  }

  return null;
};

export default PartnerApplicationPage;