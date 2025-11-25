import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext"; // Notify için

const PartnerApplicationPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState("loading"); 
  const [uploading, setUploading] = useState(false);
  const { notify } = useCart();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) { navigate("/login"); return; }
    setUser(storedUser);

    if (storedUser.applicationStatus === 'approved') {
      navigate(storedUser.role === 'vendor' ? '/vendor' : '/courier');
    } else if (storedUser.applicationStatus === 'pending') {
      setStatus("pending");
    } else {
      setStatus("form");
    }
  }, [navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // RESİM YÜKLEME (Ehliyet vb.)
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    try {
      const res = await axios.post("http://localhost:5000/api/upload", data);
      setFormData({ ...formData, licenseImage: res.data });
      notify("Belge yüklendi! 📄", "success");
    } catch (err) { notify("Yükleme hatası", "error"); } 
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/users/${user._id}/apply`, formData);
      // LocalStorage güncelle
      const updatedUser = { ...user, applicationStatus: 'pending' };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setStatus("pending");
    } catch (err) { notify("Hata oluştu", "error"); }
  };

  if (status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md border-l-4 border-yellow-400">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Başvurunuz İnceleniyor</h2>
          <p className="text-gray-600">
            Yöneticilerimiz belgelerinizi kontrol ediyor. Bu süreçte sitemizi <b>Müşteri</b> olarak kullanmaya devam edebilirsiniz.
          </p>
          <button onClick={() => navigate("/")} className="mt-6 bg-pink-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-pink-700">
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  if (status === "form" && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans pt-20">
        <div className="bg-white w-full max-w-lg p-8 rounded-3xl shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {user.role === 'vendor' ? '🏪 Mağaza Başvurusu' : '🛵 Kurye Başvurusu'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            {/* KURYE FORMU */}
            {user.role === 'courier' && (
              <>
                <input name="phone" placeholder="Cep Telefonu" onChange={handleChange} className="w-full p-3 border rounded" required />
                <select name="vehicleType" onChange={handleChange} className="w-full p-3 border rounded bg-white">
                  <option value="">Araç Tipi Seçiniz...</option>
                  <option value="motor">Motosiklet</option>
                  <option value="car">Otomobil</option>
                </select>
                <input name="plateNumber" placeholder="Plaka No" onChange={handleChange} className="w-full p-3 border rounded" required />
                
                {/* EHLİYET YÜKLEME */}
                <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-center">
                   <label className="cursor-pointer block">
                     <span className="text-blue-600 font-bold">{uploading ? "Yükleniyor..." : "+ Ehliyet Fotoğrafı Yükle"}</span>
                     <input type="file" className="hidden" onChange={handleUpload} accept="image/*" required />
                   </label>
                   {formData.licenseImage && <p className="text-xs text-green-600 mt-2">Dosya Eklendi ✅</p>}
                </div>
              </>
            )}

            {/* SATICI FORMU (Değişiklik yok, aynı kalabilir) */}
            {user.role === 'vendor' && (
               <>
                <input name="companyName" placeholder="Resmi Şirket Adı" onChange={handleChange} className="w-full p-3 border rounded" required />
                <input name="taxNumber" placeholder="Vergi Numarası" onChange={handleChange} className="w-full p-3 border rounded" required />
                <input name="iban" placeholder="IBAN" onChange={handleChange} className="w-full p-3 border rounded" required />
                <textarea name="address" placeholder="Mağaza Adresi" onChange={handleChange} className="w-full p-3 border rounded h-20" required />
               </>
            )}

            <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition">Başvuruyu Tamamla</button>
          </form>
        </div>
      </div>
    );
  }
  return null;
};

export default PartnerApplicationPage;