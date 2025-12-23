import { FiX, FiUser, FiMaximize } from "react-icons/fi";
import SecureImage from "../SecureImage"; // SecureImage'ın yolunu doğru ayarlayın

const UserDetailModal = ({ user, stats, onClose }) => {
  if (!user) return null;

  const getDocUrl = (data) => data?.licenseImage || data?.documentImage;

  return (
    <div className="fixed inset-0 z-[3000] flex justify-center items-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="p-6 border-b bg-gray-50 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Kullanıcı Dosyası</h3>
            <p className="text-sm text-blue-600 font-bold">{user.fullName} ({user.role.toUpperCase()})</p>
          </div>
          <button onClick={onClose} className="text-4xl text-gray-400 hover:text-red-600 transition"><FiX /></button>
        </div>

        {/* İçerik */}
        <div className="p-8 overflow-y-auto flex-1 bg-white">
            
            {/* İstatistikler */}
            {stats && (
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 text-center">
                    <p className="text-xs font-bold text-blue-400 uppercase">{stats.label}</p>
                    <p className="text-3xl font-extrabold text-blue-800">{stats.value}</p>
                </div>
                <div className="bg-purple-50 p-5 rounded-xl border border-purple-100 text-center">
                    <p className="text-xs font-bold text-purple-400 uppercase">{stats.countLabel}</p>
                    <p className="text-3xl font-extrabold text-purple-800">{stats.count}</p>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
                {/* Sol: Bilgiler */}
                <div className="space-y-4 bg-white border rounded-xl p-5 h-fit">
                    <h4 className="font-bold text-gray-700 uppercase border-b pb-2 mb-2 flex items-center gap-2"><FiUser /> Hesap Bilgileri</h4>
                    <div className="flex justify-between text-sm py-1"><span className="text-gray-500">Email:</span> <span className="font-bold">{user.email}</span></div>
                    <div className="flex justify-between text-sm py-1"><span className="text-gray-500">Kayıt:</span> <span className="font-bold">{new Date(user.createdAt).toLocaleDateString()}</span></div>
                    <div className="flex justify-between text-sm py-1"><span className="text-gray-500">Durum:</span> <span className={`font-bold ${user.isVerified ? "text-green-600":"text-red-500"}`}>{user.isVerified ? "Onaylı" : "Onaysız"}</span></div>
                    
                    {/* Başvuru Detayları */}
                    {user.applicationData && (
                        <div className="mt-6 pt-4 border-t">
                          <h4 className="font-bold text-gray-700 uppercase border-b pb-2 mb-2">İş / Başvuru Bilgileri</h4>
                          {Object.entries(user.applicationData).map(([k, v]) => {
                              if (k === 'licenseImage' || k === 'documentImage' || k === 'requestedRole' || k === 'rejectionReason') return null;
                              return <div key={k} className="flex justify-between py-2 text-sm border-b border-gray-50 last:border-0"><span className="text-gray-500 uppercase text-xs font-bold">{k}:</span> <span className="font-medium text-right pl-2">{v}</span></div>
                          })}
                        </div>
                    )}
                </div>

                {/* Sağ: Belge Görseli */}
                <div className="h-full flex flex-col">
                    <h4 className="font-bold text-gray-700 uppercase border-b pb-2 mb-4 flex items-center gap-2">📷 Resmi Belge</h4>
                    {getDocUrl(user.applicationData) ? (
                        <div className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 flex items-center justify-center group cursor-zoom-in hover:border-blue-400 transition relative min-h-[300px]" onClick={() => window.open(getDocUrl(user.applicationData), '_blank')}>
                            <SecureImage src={getDocUrl(user.applicationData)} className="max-h-80 max-w-full object-contain rounded shadow-sm" alt="Belge" />
                            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-3 py-1 rounded pointer-events-none flex items-center gap-1"><FiMaximize /> Büyüt</div>
                        </div>
                    ) : <div className="text-center py-20 bg-gray-50 rounded-xl text-gray-400 border border-dashed text-lg">Belge Yüklenmemiş</div>}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;