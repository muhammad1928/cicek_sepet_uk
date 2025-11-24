import { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";

const AdminApplications = () => {
  const [applicants, setApplicants] = useState([]);
  const { notify } = useCart();

  const fetchApplicants = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      const pendingUsers = res.data.filter(u => u.applicationStatus === 'pending');
      setApplicants(pendingUsers);
    } catch (err) { console.log(err); }
  };

  useEffect(() => { fetchApplicants(); }, []);

  const handleDecision = async (userId, status) => {
    const action = status === 'approved' ? 'ONAYLAMAK' : 'REDDETMEK';
    if(!confirm(`Bu başvuruyu ${action} istiyor musunuz?`)) return;

    try {
      await axios.put(`http://localhost:5000/api/users/${userId}/application-status`, { status });
      notify(`Başvuru ${status === 'approved' ? 'Onaylandı ✅' : 'Reddedildi ❌'}`, status === 'approved' ? "success" : "error");
      fetchApplicants();
    } catch (err) { notify("İşlem sırasında hata oluştu", "error"); }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">
          Bekleyen Başvurular 
          <span className="ml-2 text-sm bg-orange-100 text-orange-600 px-2 py-1 rounded-full">{applicants.length}</span>
        </h2>
        <button onClick={fetchApplicants} className="text-blue-600 hover:underline text-sm font-bold">🔄 Yenile</button>
      </div>

      {applicants.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed">
          Şu an onay bekleyen başvuru yok.
        </div>
      ) : (
        <div className="grid gap-6">
          {applicants.map(app => (
            <div key={app._id} className="bg-white rounded-xl shadow-md border-l-4 border-l-orange-400 overflow-hidden p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-4 border-b pb-3 border-gray-100">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{app.username}</h3>
                  <p className="text-sm text-gray-500">{app.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase text-white shadow ${app.role === 'vendor' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                  {app.role === 'vendor' ? '🏪 Mağaza Başvurusu' : '🛵 Kurye Başvurusu'}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg text-sm mb-6 border border-gray-200">
                {app.applicationData && Object.entries(app.applicationData).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <span className="font-bold text-gray-400 uppercase text-[10px] tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-medium text-gray-800 break-words">{value}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 justify-end">
                <button onClick={() => handleDecision(app._id, 'rejected')} className="px-6 py-2 border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition">Reddet</button>
                <button onClick={() => handleDecision(app._id, 'approved')} className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-lg transition transform active:scale-95">Onayla ve Yetki Ver</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminApplications;