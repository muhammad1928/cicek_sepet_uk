import { FiEye, FiActivity, FiUser, FiShield, FiLock } from "react-icons/fi";

const UserTable = ({ 
  users, 
  currentUser, 
  loading, 
  onViewDetails, 
  onActivityLog, 
  onEditRole, 
  onToggleBlock 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 text-xs uppercase text-gray-600">
          <tr>
            <th className="p-4">Kullanıcı</th>
            <th className="p-4">Rol</th>
            <th className="p-4">Durum</th>
            <th className="p-4 text-right">İşlem</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((u) => (
            <tr key={u._id} className={`hover:bg-gray-50 ${u.isBlocked ? 'bg-red-50' : ''}`}>
              <td className="p-4">
                <div className="font-bold text-gray-800 flex items-center gap-2">
                  {u.fullName} 
                  {u._id === currentUser._id && <span className="text-[10px] bg-purple-100 text-purple-700 px-1 rounded font-bold">BEN</span>}
                </div>
                <div className="text-xs text-gray-500">{u.email}</div>
              </td>
              <td className="p-4">
                <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                  u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                  u.role === 'vendor' ? 'bg-pink-100 text-pink-700' :
                  u.role === 'courier' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {u.role}
                </span>
              </td>
              <td className="p-4">
                {u.isBlocked 
                  ? <span className="text-red-600 font-bold text-xs bg-red-100 px-2 py-1 rounded flex items-center gap-1 w-fit"><FiLock /> Engelli</span> 
                  : <span className="text-green-600 font-bold text-xs bg-green-100 px-2 py-1 rounded flex items-center gap-1 w-fit"><FiShield /> Aktif</span>
                }
              </td>
              <td className="p-4 text-right space-x-2">
                {/* Aktivite */}
                <button 
                  onClick={() => onActivityLog(u)} 
                  className="text-indigo-500 hover:text-indigo-700 p-2 bg-indigo-50 rounded-lg transition hover:bg-indigo-100" 
                  title="Aktivite Geçmişi"
                >
                  <FiActivity />
                </button>

                {/* Detay */}
                <button onClick={() => onViewDetails(u)} className="text-blue-500 hover:text-blue-700 p-2 bg-blue-50 rounded-lg transition" title="Detayları Gör">
                  <FiEye />
                </button>
                
                {/* İşlemler (Kendine yapamaz) */}
                {u._id !== currentUser._id && (
                  <>
                    <button onClick={() => onEditRole(u)} className="text-purple-500 hover:text-purple-700 p-2 bg-purple-50 rounded-lg transition" title="Rol Değiştir">
                      <FiUser />
                    </button>
                    
                    <button 
                      onClick={() => onToggleBlock(u)} 
                      className={`p-2 rounded-lg transition font-bold ${u.isBlocked ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-red-600 bg-red-50 hover:bg-red-100'}`}
                      title={u.isBlocked ? "Engeli Kaldır" : "Engelle"}
                    >
                      {u.isBlocked ? <FiShield /> : <FiLock />}
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && !loading && <div className="p-8 text-center text-gray-400 italic">Kullanıcı bulunamadı.</div>}
    </div>
  );
};

export default UserTable;