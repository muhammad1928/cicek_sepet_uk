const RoleChangeModal = ({ user, currentRole, setRole, onConfirm, onCancel }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center">
        <h3 className="text-lg font-bold mb-4">Rol Değiştir: {user.fullName}</h3>
        <select 
          value={currentRole} 
          onChange={(e) => setRole(e.target.value)} 
          className="w-full p-3 border rounded-lg mb-6 bg-white outline-none focus:border-blue-500"
        >
            <option value="customer">Müşteri</option>
            <option value="vendor">Satıcı (Dükkan)</option>
            <option value="courier">Kurye</option>
            <option value="admin">Yönetici</option>
        </select>
        <div className="flex gap-3 justify-center">
          <button onClick={onCancel} className="px-4 py-2 border rounded-lg hover:bg-gray-50 font-bold text-gray-600">İptal</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg">Kaydet</button>
        </div>
      </div>
    </div>
  );
};

export default RoleChangeModal;