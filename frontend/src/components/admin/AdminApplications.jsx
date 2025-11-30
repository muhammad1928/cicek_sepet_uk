import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import ConfirmModal from "../ConfirmModal";
import ApplicationDetailsModal from "./ApplicationDetailsModal"; // <--- YENİ BİLEŞEN
import { FiRefreshCw } from "react-icons/fi";

const AdminApplications = () => {
  const [applicants, setApplicants] = useState([]);
  
  // --- MODAL STATE'LERİ ---
  const [selectedApp, setSelectedApp] = useState(null); // Detay modalı için seçilen başvuru
  const [confirmData, setConfirmData] = useState(null); // Onay/Emin misin modalı
  const [rejectModal, setRejectModal] = useState({ isOpen: false, userId: null }); // Red modalı
  const [rejectReason, setRejectReason] = useState(""); 

  const { notify } = useCart();
  const isMounted = useRef(false);
  const timerRef = useRef(null);

  // 1. Başvuruları Çek
  const fetchApplicants = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      if (isMounted.current) {
        const pendingUsers = res.data.filter(u => u.applicationStatus === 'pending');
        setApplicants(pendingUsers);
      }
    } catch (err) { console.log(err); } 
    finally {
      if (isMounted.current) {
        timerRef.current = setTimeout(() => {
          if (document.visibilityState === 'visible') fetchApplicants();
        }, 30000);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchApplicants();
    return () => {
      isMounted.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fetchApplicants]);

  // 2. Onaylama İşlemi (KİŞİSELLEŞTİRİLMİŞ MESAJ)
  const handleApproveRequest = (user) => {
    // Detay modalını kapatabiliriz veya açık bırakabiliriz, kapatmak daha temiz görünür
    setSelectedApp(null); 
    
    const roleName = user.applicationData?.requestedRole === 'vendor' ? 'Satıcı Paneline' : 'Kurye Paneline';

    setConfirmData({
      isOpen: true,
      title: `Başvuruyu Onayla: ${user.fullName}`,
      // --- İSTEDİĞİN KİŞİSELLEŞTİRİLMİŞ MESAJ ---
      message: `"${user.fullName}" adlı kullanıcı ${roleName} erişim sağlayabilecek. Bu işlemi onaylıyor musunuz?`,
      // ------------------------------------------
      isDanger: false,
      action: async () => {
        try {
          await axios.put(`http://localhost:5000/api/users/${user._id}/application-status`, { status: 'approved' });
          notify(`${user.fullName} onaylandı! ✅`, "success");
          fetchApplicants();
        } catch (err) { notify("Hata oluştu", "error"); }
        setConfirmData(null);
      }
    });
  };

  // 3. Reddetme Başlatma
  const handleRejectClick = (userId) => {
    setSelectedApp(null);
    setRejectModal({ isOpen: true, userId });
    setRejectReason("");
  };

  // 4. Reddetme Gönderme
  const submitReject = async () => {
    if (!rejectReason.trim()) return notify("Lütfen bir sebep yazın!", "warning");
    try {
      await axios.put(`http://localhost:5000/api/users/${rejectModal.userId}/application-status`, { 
        status: 'rejected',
        reason: rejectReason 
      });
      notify("Başvuru Reddedildi 📧", "success");
      setRejectModal({ isOpen: false, userId: null });
      fetchApplicants();
    } catch (err) { notify("Hata oluştu", "error"); }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      
      {/* Üst Kısım */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">
          Bekleyen Başvurular <span className="ml-2 text-sm bg-orange-100 text-orange-600 px-2 py-1 rounded-full">{applicants.length}</span>
        </h2>
        <button onClick={fetchApplicants} className="text-blue-600 hover:underline text-sm font-bold flex items-center gap-1">
          <FiRefreshCw /> Yenile
        </button>
      </div>

      {/* Liste */}
      {applicants.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="text-4xl mb-2">📭</div>
          <p>Şu an onay bekleyen başvuru yok.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {applicants.map(app => (
            <div key={app._id} className="bg-white rounded-xl shadow-sm border-l-4 border-l-orange-400 overflow-hidden p-6 hover:shadow-md transition flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-gray-800">{app.fullName}</h3>
                  <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase text-white tracking-wider ${app.applicationData?.requestedRole === 'vendor' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                    {app.applicationData?.requestedRole === 'vendor' ? 'Mağaza' : 'Kurye'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{app.email}</p>
              </div>
              <button 
                onClick={() => setSelectedApp(app)} 
                className="bg-gray-900 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-black transition shadow-lg flex items-center gap-2"
              >
                <span>📄</span> İncele & Karar Ver
              </button>
            </div>
          ))}
        </div>
      )}

      {/* --- YENİ PORTAL DETAY MODALI --- */}
      {selectedApp && (
        <ApplicationDetailsModal 
          application={selectedApp} 
          onClose={() => setSelectedApp(null)}
          onApprove={handleApproveRequest} // Onay fonksiyonunu gönderiyoruz
          onReject={handleRejectClick}     // Red fonksiyonunu gönderiyoruz
        />
      )}

      {/* Reddetme Modalı (Portal'a taşınabilir ama şimdilik burada kalsın, z-index'i yüksek) */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Başvuru Reddi</h3>
              <p className="text-gray-500 text-sm">Lütfen red sebebini belirtin.</p>
            </div>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full p-4 border-2 border-red-100 rounded-xl h-32 resize-none outline-none focus:border-red-500" placeholder="Sebep..." />
            <div className="flex gap-4 mt-4">
              <button onClick={() => setRejectModal({ isOpen: false, userId: null })} className="flex-1 py-3 border rounded-xl font-bold text-gray-600 hover:bg-gray-100">İptal</button>
              <button onClick={submitReject} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg">Gönder</button>
            </div>
          </div>
        </div>
      )}

      {/* Onay Modalı */}
      {confirmData && (
        <ConfirmModal 
          title={confirmData.title} 
          message={confirmData.message} 
          isDanger={confirmData.isDanger} 
          onConfirm={confirmData.action} 
          onCancel={() => setConfirmData(null)} 
        />
      )}

    </div>
  );
};

export default AdminApplications;