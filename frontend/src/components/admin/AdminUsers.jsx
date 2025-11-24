import { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const { notify } = useCart();
  const userMe = JSON.parse(localStorage.getItem("user")); 

  const [modalUser, setModalUser] = useState(null); // İşlem yapılacak kullanıcı
  const [actionType, setActionType] = useState(null); // 'block', 'role', 'password'
  const [newRole, setNewRole] = useState("customer");
  const [newPass, setNewPass] = useState("");

  const fetchUsers = async () => {
    try { const res = await axios.get("http://localhost:5000/api/users"); setUsers(res.data); } catch (err) { console.log(err); }
  };
  useEffect(() => { fetchUsers(); }, []);

  const handleConfirm = async () => {
    try {
      if (actionType === 'role') {
        await axios.put(`http://localhost:5000/api/users/${modalUser._id}/role`, { role: newRole });
        notify("Rol güncellendi", "success");
      } else if (actionType === 'block') {
        await axios.put(`http://localhost:5000/api/users/${modalUser._id}/block`);
        notify("Kullanıcı durumu değişti", "success");
      } else if (actionType === 'password') {
        if(newPass.length < 6) return notify("Şifre kısa", "error");
        await axios.put(`http://localhost:5000/api/users/${modalUser._id}/admin-reset-password`, { newPassword: newPass });
        notify("Şifre değiştirildi", "success");
      }
      setModalUser(null);
      fetchUsers();
    } catch (err) { notify("Hata oluştu", "error"); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Users ({users.length})</h2>
        <button onClick={fetchUsers} className="text-blue-600 font-bold hover:underline">Yenile</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
            <tr><th className="p-4">User</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4 text-right">İşlemler</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u._id} className={`hover:bg-gray-50 ${u.isBlocked ? 'bg-red-50' : ''}`}>
                <td className="p-4">
                  <div className="font-bold text-gray-800">{u.username} {u._id===userMe._id && <span className="text-[10px] bg-purple-100 text-purple-700 px-1 rounded">BEN</span>}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </td>
                <td className="p-4"><span className={`text-xs font-bold px-2 py-1 rounded uppercase bg-gray-100 text-gray-600`}>{u.role}</span></td>
                <td className="p-4">{u.isBlocked ? <span className="text-xs font-bold text-red-600">🚫 Engelli</span> : <span className="text-xs font-bold text-green-600">✅ Active</span>}</td>
                <td className="p-4 text-right space-x-2">
                  {u._id !== userMe._id && (
                    <>
                      <button onClick={() => {setModalUser(u); setActionType('password');}} className="text-gray-500 hover:text-blue-600" title="Şifre">🔑</button>
                      <button onClick={() => {setModalUser(u); setActionType('role'); setNewRole(u.role);}} className="text-gray-500 hover:text-purple-600" title="Rol">👮‍♂️</button>
                      <button onClick={() => {setModalUser(u); setActionType('block');}} className={`text-xs font-bold px-2 py-1 rounded border ${u.isBlocked ? 'border-green-500 text-green-600' : 'border-red-300 text-red-500'}`}>{u.isBlocked ? "Unblock" : "Block"}</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TEK MODAL (DİNAMİK İÇERİK) */}
      {modalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center">
            <h3 className="text-lg font-bold mb-4">
              {actionType === 'block' ? (modalUser.isBlocked ? "Engeli Kaldır?" : "Kullanıcıyı Engelle?") : 
               actionType === 'role' ? "Rol Değiştir" : "Şifre Sıfırla"}
            </h3>
            
            {actionType === 'role' && (
              <select value={newRole} onChange={e=>setNewRole(e.target.value)} className="w-full p-2 border rounded mb-4">
                <option value="customer">Müşteri</option><option value="vendor">Dükkan</option><option value="courier">Kurye</option><option value="admin">Yönetici</option>
              </select>
            )}
            
            {actionType === 'password' && (
              <input type="text" placeholder="Yeni Şifre" className="w-full p-2 border rounded mb-4 font-mono text-center" value={newPass} onChange={e=>setNewPass(e.target.value)} />
            )}

            <div className="flex gap-3 justify-center">
              <button onClick={() => setModalUser(null)} className="px-4 py-2 border rounded hover:bg-gray-50">İptal</button>
              <button onClick={handleConfirm} className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Onayla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;