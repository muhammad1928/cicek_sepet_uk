import { useState } from "react";
import { userRequest, publicRequest } from "../../requestMethods";
import { useCart } from "../../context/CartContext";
import { FiUser, FiMail, FiPhone, FiShield, FiEdit2, FiSave, FiX, FiLock } from "react-icons/fi";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const UserInfo = ({ user }) => {
  const { notify } = useCart();

  // --- PROFİL DÜZENLEME STATE'LERİ ---
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user.fullName || "",
    phone: user.phone || ""
  });

  // --- ŞİFRE DEĞİŞTİRME STATE'LERİ ---
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({ oldPass: "", newPass: "", confirmPass: "" });
  
  // Göz İkonları
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Güvenlik Kuralları
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [isMatch, setIsMatch] = useState(true); 
  const [rules, setRules] = useState({ length: false, upper: false, lower: false, number: false, special: false });


  // --- 1. PROFİL GÜNCELLEME FONKSİYONU ---
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await userRequest.put(`/users/${user._id}`, profileData);
      
      // LocalStorage ve UI'ı Güncelle
      const updatedUser = { ...user, ...res.data }; 
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("user-change")); // Navbar vb. güncellensin
      
      notify("Profil bilgileri güncellendi! ✨", "success");
      setIsEditing(false);
    } catch (err) {
      notify("Güncelleme başarısız.", "error");
    }
  };


  // --- 2. ŞİFRE İŞLEMLERİ ---
  const handleNewPassChange = (e) => {
    const val = e.target.value;
    setPasswords({ ...passwords, newPass: val });

    const newRules = {
      length: val.length >= 8,
      upper: /[A-Z]/.test(val),
      lower: /[a-z]/.test(val),
      number: /[0-9]/.test(val),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(val)
    };
    setRules(newRules);
    setPasswordValid(Object.values(newRules).every(Boolean));
    if (passwords.confirmPass) setIsMatch(val === passwords.confirmPass);
  };

  const handleConfirmPassChange = (e) => {
    const val = e.target.value;
    setPasswords({ ...passwords, confirmPass: val });
    setIsMatch(val === passwords.newPass);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!passwords.oldPass) return notify("Eski şifrenizi girin.", "warning");
    if (!passwordValid) return notify("Şifre kurallara uymuyor.", "error");
    if (!isMatch) return notify("Şifreler eşleşmiyor.", "error");

    try {
      await userRequest.put(`/users/${user._id}/change-password`, {
        oldPassword: passwords.oldPass,
        newPassword: passwords.newPass
      });
      
      notify("Şifreniz başarıyla değişti. Lütfen tekrar giriş yapın.", "success");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("user-change"));
      setTimeout(() => window.location.href="/login", 2000);
    } catch (err) {
      notify(err.response?.data?.message || "Şifre değiştirilemedi.", "error");
    }
  };

  // Modern Input Stili
  const modernInputClass = `
    w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent 
    outline-none transition-all duration-300
    focus:bg-white focus:border-pink-500 focus:shadow-lg focus:shadow-pink-500/10
    placeholder-gray-300 text-gray-700 font-medium
  `;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* --- 1. KİŞİSEL BİLGİLER KARTI --- */}
      <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative overflow-hidden">
        
        {/* Dekoratif Arka Plan */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-50 to-transparent rounded-bl-full pointer-events-none -z-10"></div>

        <div className="flex justify-between items-center mb-8">
           <div className="flex items-center gap-3">
              <div className="p-3 bg-pink-100 text-pink-600 rounded-xl"><FiUser size={24} /></div>
              <div>
                <h2 className="text-2xl font-extrabold text-gray-800">Kişisel Bilgiler</h2>
                <p className="text-xs text-gray-500 font-medium">Kimlik ve iletişim bilgileriniz</p>
              </div>
           </div>
           {!isEditing ? (
             <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition">
               <FiEdit2 /> Düzenle
             </button>
           ) : (
             <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:bg-gray-100 px-4 py-2 rounded-xl transition">
               <FiX /> İptal
             </button>
           )}
        </div>

        {/* --- FORM / GÖRÜNTÜLEME --- */}
        <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
           
           {/* Ad Soyad */}
           <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Ad Soyad</label>
              <div className="relative">
                <FiUser className="absolute top-4 left-4 text-gray-400" />
                <input 
                  disabled={!isEditing}
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                  className={`${modernInputClass} pl-11 ${!isEditing && 'bg-white border-gray-100 text-gray-500 cursor-default'}`} 
                />
              </div>
           </div>

           {/* E-Posta (Değiştirilemez) */}
           <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">E-Posta Adresi</label>
              <div className="relative group">
                <FiMail className="absolute top-4 left-4 text-gray-400 group-hover:text-pink-500 transition" />
                <input 
                  disabled 
                  value={user.email} 
                  className={`${modernInputClass} pl-11 bg-white border-gray-100 text-gray-400 cursor-not-allowed opacity-80`}
                />
                <span className="absolute right-4 top-4 text-[10px] font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded">ONAYLI</span>
              </div>
           </div>

           {/* Telefon (Yeni Alan) */}
           <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Cep Telefonu</label>
              <div className="relative">
                <FiPhone className="absolute top-4 left-4 text-gray-400" />
                <input 
                  disabled={!isEditing}
                  value={profileData.phone}
                  placeholder="+44 7XXX XXXXXX"
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className={`${modernInputClass} pl-11 ${!isEditing && 'bg-white border-gray-100 text-gray-500 cursor-default'}`} 
                />
              </div>
           </div>

           {/* Rol (Badge) */}
           <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Hesap Türü</label>
              <div className="relative">
                <FiShield className="absolute top-4 left-4 text-gray-400" />
                <div className="w-full p-4 pl-11 bg-white rounded-2xl border border-gray-100 flex items-center">
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wide">
                    {user.role}
                  </span>
                </div>
              </div>
           </div>

           {/* Kaydet Butonu */}
           {isEditing && (
             <div className="md:col-span-2 flex justify-end mt-2">
               <button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:scale-105 transition transform flex items-center gap-2">
                 <FiSave /> Değişiklikleri Kaydet
               </button>
             </div>
           )}

        </form>
      </div>


      {/* --- 2. GÜVENLİK KARTI (ŞİFRE) --- */}
      <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 relative overflow-hidden">
         
         {/* Dekoratif Arka Plan */}
         <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-50 to-transparent rounded-br-full pointer-events-none -z-10"></div>

         <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><FiLock size={24} /></div>
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-800">Şifre & Güvenlik</h2>
                  <p className="text-xs text-gray-500 font-medium">Hesabınızı koruyun</p>
                </div>
            </div>
            {!showPasswordForm && (
              <button onClick={() => setShowPasswordForm(true)} className="text-sm font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-5 py-2.5 rounded-xl transition border border-purple-200">
                Şifremi Değiştir
              </button>
            )}
         </div>

         {/* ŞİFRE FORMU (AÇILIR) */}
         {showPasswordForm && (
           <form onSubmit={handlePasswordUpdate} className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 animate-fade-in-down space-y-5">
              
              <div className="flex justify-between items-center mb-2">
                 <h4 className="font-bold text-gray-700">Yeni Şifre Oluştur</h4>
                 <button type="button" onClick={() => setShowPasswordForm(false)} className="text-gray-400 hover:text-red-500"><FiX size={20}/></button>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input type={showOldPass ? "text" : "password"} placeholder="Mevcut Şifreniz" required className={`${modernInputClass} bg-white`} onChange={e => setPasswords({...passwords, oldPass: e.target.value})} />
                  <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-4 top-4 text-gray-400 hover:text-purple-600">{showOldPass ? <FaEyeSlash/> : <FaEye/>}</button>
                </div>

                <div className="relative">
                  <input type={showNewPass ? "text" : "password"} placeholder="Yeni Şifre" required minLength={8} className={`${modernInputClass} bg-white`} onChange={handleNewPassChange} onFocus={()=>setPasswordFocused(true)} onBlur={()=>setPasswordFocused(false)} />
                  <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-4 top-4 text-gray-400 hover:text-purple-600">{showNewPass ? <FaEyeSlash/> : <FaEye/>}</button>
                  
                  {/* Kriter Listesi */}
                  {(passwordFocused || (passwords.newPass && !passwordValid)) && (
                    <div className="mt-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm grid grid-cols-2 gap-2 text-[10px]">
                        <RuleItem label="Min 8 Karakter" valid={rules.length} />
                        <RuleItem label="Büyük Harf" valid={rules.upper} />
                        <RuleItem label="Küçük Harf" valid={rules.lower} />
                        <RuleItem label="Rakam" valid={rules.number} />
                        <RuleItem label="Özel Karakter" valid={rules.special} />
                    </div>
                  )}
                </div>

                <div className="relative">
                  <input type={showConfirmPass ? "text" : "password"} placeholder="Yeni Şifre (Tekrar)" required minLength={8} className={`${modernInputClass} bg-white ${!isMatch && passwords.confirmPass ? 'border-red-300 bg-red-50' : ''}`} onChange={handleConfirmPassChange} />
                  <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-4 top-4 text-gray-400 hover:text-purple-600">{showConfirmPass ? <FaEyeSlash/> : <FaEye/>}</button>
                </div>
                
                {!isMatch && passwords.confirmPass && <p className="text-red-500 text-xs font-bold animate-pulse pl-1">⚠️ Şifreler eşleşmiyor!</p>}

                <button type="submit" disabled={!passwordValid || !isMatch} className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition transform active:scale-95 ${(!passwordValid || !isMatch) ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-purple-500/30'}`}>
                  Şifreyi Güncelle
                </button>
              </div>
           </form>
         )}

      </div>

    </div>
  );
};

const RuleItem = ({ label, valid }) => (
  <div className={`flex items-center gap-2 transition-all duration-300 ${valid ? "text-green-600 opacity-100" : "text-gray-400 opacity-60"}`}>
    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] border ${valid ? 'bg-green-100 border-green-200' : 'border-gray-200'}`}>{valid ? "✓" : ""}</span>
    <span className="font-bold">{label}</span>
  </div>
);

export default UserInfo;