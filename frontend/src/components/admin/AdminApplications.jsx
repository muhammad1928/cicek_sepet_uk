import { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import ConfirmModal from "../ConfirmModal";

const AdminApplications = () => {
  const [applicants, setApplicants] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const { notify } = useCart();

  const fetchApplicants = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      const pendingUsers = res.data.filter(u => u.applicationStatus === 'pending');
      setApplicants(pendingUsers);
    } catch (err) { console.log(err); }
  };

  // --- PERFORMANS AYARI ---
  useEffect(() => {
    fetchApplicants();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') fetchApplicants();
    }, 30000); // 30 Saniye
    return () => clearInterval(interval); // Temizlik
  }, []);
  // -----------------------

  const handleDecisionRequest = (userId, status) => {
    if (selectedApp) setSelectedApp(null);
    setConfirmData({
      isOpen: true, title: status==='approved'?"Onayla?":"Reddet?", message: "İşlem yapılsın mı?", isDanger: status==='rejected',
      action: async () => { 
        try { await axios.put(`http://localhost:5000/api/users/${userId}/application-status`, { status }); notify("İşlem tamam", "success"); fetchApplicants(); } 
        catch { notify("Hata", "error"); } 
        setConfirmData(null); 
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="bg-white p-4 rounded border shadow-sm flex justify-between items-center">
        <h2 className="font-bold text-xl text-gray-800">Başvurular ({applicants.length})</h2>
        <button onClick={fetchApplicants} className="text-blue-600 font-bold hover:underline text-sm">Yenile</button>
      </div>
      {applicants.length === 0 ? <div className="text-center py-20 text-gray-400">Başvuru yok.</div> : 
        <div className="grid gap-4">{applicants.map(a=>(<div key={a._id} className="bg-white p-5 rounded shadow border-l-4 border-orange-400 flex justify-between items-center"><div><h3 className="font-bold">{a.fullName}</h3><span className="text-xs bg-gray-100 px-2 py-1 rounded uppercase">{a.role === 'vendor' ? 'Mağaza' : 'Kurye'}</span></div><button onClick={()=>setSelectedApp(a)} className="bg-gray-800 text-white px-4 py-2 rounded font-bold hover:bg-black">İncele</button></div>))}</div>
      }
      
      {/* Detay Modalı */}
      {selectedApp && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between"><h3 className="font-bold text-xl">{selectedApp.fullName}</h3><button onClick={()=>setSelectedApp(null)} className="text-2xl font-bold text-gray-400 hover:text-red-500">✕</button></div>
            <div className="p-8 overflow-y-auto bg-gray-50 space-y-4">
               <div className="grid md:grid-cols-2 gap-4">{selectedApp.applicationData && Object.entries(selectedApp.applicationData).map(([k,v]) => k!=='licenseImage' && <div key={k} className="bg-white p-3 rounded border"><span className="block text-xs font-bold text-gray-400 uppercase">{k}</span><span className="font-medium">{v}</span></div>)}</div>
               {selectedApp.applicationData?.licenseImage && <img src={selectedApp.applicationData.licenseImage} className="w-full h-64 object-contain bg-white border rounded" />}
            </div>
            <div className="p-6 border-t flex justify-end gap-4 bg-white"><button onClick={()=>handleDecisionRequest(selectedApp._id, 'rejected')} className="px-6 py-2 border border-red-200 text-red-600 font-bold rounded hover:bg-red-50">Reddet</button><button onClick={()=>handleDecisionRequest(selectedApp._id, 'approved')} className="px-6 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700">Onayla</button></div>
          </div>
        </div>
      )}
      {confirmData && <ConfirmModal title={confirmData.title} message={confirmData.message} isDanger={confirmData.isDanger} onConfirm={confirmData.action} onCancel={() => setConfirmData(null)} />}
    </div>
  );
};

export default AdminApplications;