import { useState, useEffect } from "react";
import { userRequest } from "../../requestMethods";
import { useCart } from "../../context/CartContext";

// Components
import ConfirmModal from "../ConfirmModal";
import UserActivityModal from "./UserActivityModal";
import UserFilters from "./adminUserComponents/UserFilters";
import UserTable from "./adminUserComponents/UserTable";
import UserDetailModal from "./adminUserComponents/UserDetailModal";
import RoleChangeModal from "./adminUserComponents/RoleChangeModal";

const AdminUsers = () => {
  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const userMe = JSON.parse(localStorage.getItem("user"));
  const { notify } = useCart();

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  // Modals
  const [selectedUserLog, setSelectedUserLog] = useState(null); // Aktivite
  const [viewUser, setViewUser] = useState(null); // Detay
  const [userStats, setUserStats] = useState(null); // İstatistik
  const [modalUser, setModalUser] = useState(null); // Rol
  const [newRole, setNewRole] = useState("customer");
  const [confirmData, setConfirmData] = useState(null); // Onay (Bloke)

  // API Call
  const fetchUsers = async () => {
    setLoading(true);
    try { 
      const res = await userRequest.get("/users"); 
      setUsers(res.data); 
    } catch (err) { 
      console.log(err); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Handlers
  const handleViewDetails = async (user) => {
    setViewUser(user);
    setUserStats(null);
    try {
      let statsData = {};
      if (user.role === 'customer') {
         const res = await userRequest.get(`/orders/find/${user._id}`);
         const totalSpent = res.data.reduce((acc, o) => acc + o.totalAmount, 0);
         statsData = { label: "Toplam Harcama", value: `£${totalSpent.toFixed(2)}`, countLabel: "Sipariş Sayısı", count: res.data.length };
      } else if (user.role === 'vendor') {
         const res = await userRequest.get(`/orders/vendor/${user._id}`);
         const totalSales = res.data.reduce((acc, o) => acc + o.totalAmount, 0);
         statsData = { label: "Toplam Ciro", value: `£${totalSales.toFixed(2)}`, countLabel: "Alınan Sipariş", count: res.data.length };
      } else if (user.role === 'courier') {
         const res = await userRequest.get("/orders");
         const myDeliveries = res.data.filter(o => o.courierId === user._id && o.status === "Teslim Edildi");
         const earnings = myDeliveries.reduce((acc, o) => acc + (o.totalAmount * 0.10), 0);
         statsData = { label: "Toplam Kazanç", value: `£${earnings.toFixed(2)}`, countLabel: "Teslimat Sayısı", count: myDeliveries.length };
      }
      setUserStats(statsData);
    } catch (err) { console.log(err); }
  };

  const handleRoleUpdate = async () => {
    try {
        await userRequest.put(`/users/${modalUser._id}/role`, { role: newRole });
        notify("Kullanıcı rolü güncellendi", "success");
        setModalUser(null);
        fetchUsers();
    } catch { notify("İşlem başarısız", "error"); }
  };

  const handleBlockToggle = (u) => {
    setConfirmData({ 
        isOpen: true, 
        title: u.isBlocked ? "Engeli Kaldır?" : "Kullanıcıyı Engelle?", 
        message: u.isBlocked ? "Kullanıcının erişimi tekrar açılacak." : "Kullanıcı sisteme giriş yapamayacak.", 
        isDanger: !u.isBlocked, 
        action: async () => { 
            try { await userRequest.put(`/users/${u._id}/block`); notify("Durum güncellendi", "success"); fetchUsers(); } 
            catch { notify("Hata", "error"); } 
            setConfirmData(null); 
        } 
    });
  };

  // Filter Logic
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 pt-2 animate-fade-in">
      
      {/* 1. Filtreler */}
      <UserFilters 
        totalUsers={filteredUsers.length}
        filterRole={filterRole}
        setFilterRole={setFilterRole}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onRefresh={fetchUsers}
        loading={loading}
      />

      {/* 2. Tablo */}
      <UserTable 
        users={filteredUsers}
        currentUser={userMe}
        loading={loading}
        onViewDetails={handleViewDetails}
        onActivityLog={setSelectedUserLog}
        onEditRole={(u) => { setModalUser(u); setNewRole(u.role); }}
        onToggleBlock={handleBlockToggle}
      />

      {/* 3. Modallar */}
      
      {/* Detay */}
      <UserDetailModal 
        user={viewUser} 
        stats={userStats} 
        onClose={() => setViewUser(null)} 
      />

      {/* Rol Değiştirme */}
      <RoleChangeModal 
        user={modalUser}
        currentRole={newRole}
        setRole={setNewRole}
        onConfirm={handleRoleUpdate}
        onCancel={() => setModalUser(null)}
      />

      {/* Aktivite (Zaten ayrıydı) */}
      {selectedUserLog && (
        <UserActivityModal 
          user={selectedUserLog} 
          onClose={() => setSelectedUserLog(null)} 
        />
      )}

      {/* Onay (Block) */}
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

export default AdminUsers;