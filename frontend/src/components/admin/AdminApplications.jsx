import { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import ConfirmModal from "../ConfirmModal";
import SecureImage from "../SecureImage";
// Zoom ve Pan Kütüphanesi
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { FiZoomIn, FiZoomOut, FiRotateCw, FiX, FiMaximize, FiArrowLeft, FiCheck, FiXCircle } from "react-icons/fi";

const AdminApplications = () => {
  const [applicants, setApplicants] = useState([]);
  
  // --- MODAL STATE'LERİ ---
  const [selectedApp, setSelectedApp] = useState(null); // Detay modalı
  const [confirmData, setConfirmData] = useState(null); // Onay modalı
  const [rejectModal, setRejectModal] = useState({ isOpen: false, userId: null }); // Red modalı
  const [rejectReason, setRejectReason] = useState(""); // Red sebebi
  const [zoomedImage, setZoomedImage] = useState(null); // Tam ekran zoom resmi

  const { notify } = useCart();

  // 1. Başvuruları Çek
  const fetchApplicants = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      // Sadece 'pending' (Onay bekleyen) olanları filtrele
      const pendingUsers = res.data.filter(u => u.applicationStatus === 'pending');
      setApplicants(pendingUsers);
    } catch (err) { console.log(err); }
  };

  useEffect(() => { fetchApplicants(); }, []);

  // 2. Onaylama İşlemi
  const handleApproveRequest = (userId) => {
    // Detay modalını kapatmadan işlem yapıyoruz
    if (selectedApp) setSelectedApp(null); 
    
    setConfirmData({
      isOpen: true,
      title: "Başvuruyu Onayla",
      message: "Kullanıcı sisteme erişim sağlayabilecek. Onaylıyor musunuz?",
      isDanger: false,
      action: async () => {
        try {
          await axios.put(`http://localhost:5000/api/users/${userId}/application-status`, { status: 'approved' });
          notify("Başvuru Onaylandı! ✅", "success");
          fetchApplicants();
        } catch (err) { notify("Hata oluştu", "error"); }
        setConfirmData(null);
      }
    });
  };

  // 3. Reddetme Başlatma
  const handleRejectClick = (userId) => {
    if (selectedApp) setSelectedApp(null);
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

  // Yardımcı: Resim URL'sini al
  const getImageUrl = (appData) => appData?.licenseImage || appData?.documentImage;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      
      {/* --- ÜST KISIM --- */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">
          Bekleyen Başvurular <span className="ml-2 text-sm bg-orange-100 text-orange-600 px-2 py-1 rounded-full">{applicants.length}</span>
        </h2>
        <button onClick={fetchApplicants} className="text-blue-600 hover:underline text-sm font-bold flex items-center gap-1">
          <span>🔄</span> Yenile
        </button>
      </div>

      {/* --- LİSTE --- */}
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
                  <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase text-white tracking-wider ${app.role === 'vendor' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                    {app.role === 'vendor' ? 'Mağaza' : 'Kurye'}
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

      {/* --- DETAY MODALI (TAM EKRAN ORTALAMA) --- */}
      {selectedApp && (
        // z-50: Navbar'ın üstünde
        // flex items-center justify-center: Modalı TAM ORTAYA kilitler
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          
          {/* Modal Kutusu: Ekranın %95 genişliği, %90 yüksekliği (Taşmayı önler) */}
          <div className="bg-white w-[95%] h-[90vh] max-w-6xl rounded-2xl shadow-2xl flex flex-col relative overflow-hidden border border-gray-200">
            
            {/* Header (Sabit) */}
            <div className="p-6 border-b bg-gray-50 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Başvuru Detayı</h3>
                <p className="text-sm text-blue-600 font-bold">{selectedApp.fullName}</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-gray-500 hover:text-red-600 text-4xl font-bold transition leading-none p-2">
                <FiX />
              </button>
            </div>

            {/* İçerik (Scroll Edilebilir Alan - Flex-1 ile kalan yeri kaplar) */}
            <div className="p-8 overflow-y-auto flex-1 bg-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-full">
                
                {/* Sol: Bilgiler */}
                <div className="space-y-4 h-fit bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h4 className="text-lg font-bold text-gray-700 uppercase border-b pb-2 mb-4">Kimlik & İletişim</h4>
                  {selectedApp.applicationData && Object.entries(selectedApp.applicationData).map(([key, value]) => {
                    // Resim ve teknik alanları gizle
                    if (key === 'licenseImage' || key === 'documentImage' || key === 'requestedRole' || key === 'rejectionReason') return null; 
                    return (
                      <div key={key} className="flex justify-between py-4 border-b border-gray-200 last:border-0">
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-bold text-gray-900 text-right text-lg break-all pl-6">{value}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Sağ: Belge Görseli */}
                <div className="flex flex-col h-full">
                  <h4 className="text-lg font-bold text-gray-700 uppercase border-b pb-2 mb-4">Yüklenen Belge</h4>
                  {getImageUrl(selectedApp.applicationData) ? (
                    <div 
                      className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 flex items-center justify-center group cursor-zoom-in hover:border-blue-400 transition relative min-h-[400px]"
                      onClick={() => setZoomedImage(getImageUrl(selectedApp.applicationData))}
                    >
                      <SecureImage 
                        src={getImageUrl(selectedApp.applicationData)} 
                        className="max-h-full max-w-full object-contain rounded shadow-sm" 
                        alt="Belge"
                      />
                      <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-2 rounded-lg pointer-events-none flex items-center gap-2 font-bold shadow-lg">
                        <FiMaximize /> Tıkla & Büyüt
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-xl text-gray-400 border border-dashed text-xl font-bold">Belge Yüklenmemiş.</div>
                  )}
                </div>

              </div>
            </div>

            {/* Footer (Sabit Alt Bar) */}
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-4 shrink-0 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
               <button 
                 onClick={() => setSelectedApp(null)} 
                 className="flex items-center gap-2 px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 font-bold text-lg rounded-xl hover:bg-gray-100 mr-auto shadow-sm"
               >
                 <FiArrowLeft /> Geri Dön
               </button>

               <button 
                 onClick={() => handleRejectClick(selectedApp._id)} 
                 className="flex items-center gap-2 px-8 py-4 bg-red-50 text-red-600 border-2 border-red-200 font-bold text-lg rounded-xl hover:bg-red-100 shadow-sm"
               >
                 <FiXCircle /> Reddet
               </button>
               
               <button 
                 onClick={() => handleApproveRequest(selectedApp._id)} 
                 className="flex items-center gap-2 px-10 py-4 bg-green-600 text-white font-bold text-lg rounded-xl hover:bg-green-700 shadow-lg hover:shadow-green-500/30 transition transform active:scale-95"
               >
                 <FiCheck /> Onayla
               </button>
            </div>

          </div>
        </div>
      )}

      {/* --- ZOOM MODALI (EN ÜST KATMAN - Z: 10000) --- */}
      {zoomedImage && (
        <div className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center overflow-hidden animate-fade-in">
          
          {/* Kapat Butonu */}
          <button 
            onClick={() => setZoomedImage(null)} 
            className="absolute top-5 right-5 text-white/70 hover:text-white text-5xl z-[10002] transition bg-black/50 rounded-full p-2 cursor-pointer"
          >
            <FiX />
          </button>
          
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={5} 
            centerOnInit={true}
            wheel={{ step: 0.2 }} 
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                {/* Kontrol Barı */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[10002] flex gap-6 bg-white/10 p-3 rounded-full backdrop-blur-md border border-white/20 shadow-2xl">
                  <button onClick={() => zoomIn()} className="text-white p-3 hover:bg-white/20 rounded-full transition" title="Yakınlaştır"><FiZoomIn size={32} /></button>
                  <button onClick={() => zoomOut()} className="text-white p-3 hover:bg-white/20 rounded-full transition" title="Uzaklaştır"><FiZoomOut size={32} /></button>
                  <button onClick={() => resetTransform()} className="text-white p-3 hover:bg-white/20 rounded-full transition" title="Sıfırla"><FiRotateCw size={32} /></button>
                </div>

                {/* Resim Alanı */}
                <TransformComponent 
                  wrapperClass="w-screen h-screen flex items-center justify-center" 
                  contentClass="flex items-center justify-center w-full h-full"
                >
                  <SecureImage 
                    src={zoomedImage} 
                    className="max-w-none max-h-[90vh] object-contain shadow-2xl cursor-grab active:cursor-grabbing" 
                    alt="Zoom Belge" 
                  />
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>
      )}

      {/* Reddetme Modalı */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Başvuru Reddi</h3>
              <p className="text-gray-500 text-sm">Lütfen red sebebini belirtin.</p>
            </div>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full p-4 border-2 border-red-100 rounded-xl h-32 mb-4" placeholder="Sebep..." />
            <div className="flex gap-4">
              <button onClick={() => setRejectModal({ isOpen: false, userId: null })} className="flex-1 py-4 border rounded-xl font-bold text-gray-600 hover:bg-gray-100 text-lg">İptal</button>
              <button onClick={submitReject} className="flex-1 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg text-lg">Gönder</button>
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