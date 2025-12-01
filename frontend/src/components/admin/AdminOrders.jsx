import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import InvoiceModal from "../InvoiceModal";
import { FiRefreshCw } from "react-icons/fi";
import { publicRequest, userRequest } from "../requestMethods";

// YENİ BİLEŞENLERİN IMPORTU
import OrderStats from "./adminOrderComponents/OrderStats";
import OrderFilters from "./adminOrderComponents/OrderFilters";
import OrderCard from "./adminOrderComponents/OrderCard";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tümü");

  const { notify } = useCart();
  const isMounted = useRef(false);
  const timerRef = useRef(null);

  // --- 1. SİPARİŞLERİ ÇEK (TOKEN KORUMALI) ---
  const fetchOrders = useCallback(async () => {
    try {
      // Token'ı al
      // const user = JSON.parse(localStorage.getItem("user"));
      // const token = user?.accessToken;

      // İsteğe ekle
      const res = await userRequest.get("/orders");
        // headers: { token: `Bearer ${token}` }
      // });
      
      if (isMounted.current) {
        const sortedOrders = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sortedOrders);
        setLoading(false);
      }
    } catch (err) {
      console.log("Sipariş çekme hatası:", err);
      // Eğer 401 ise kullanıcıyı login'e atabilirsin (isteğe bağlı)
    } finally {
      if (isMounted.current) {
        timerRef.current = setTimeout(() => {
          if (document.visibilityState === 'visible') fetchOrders();
        }, 30000);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchOrders();
    return () => {
      isMounted.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fetchOrders]);

  // 2. İstatistik Hesaplama
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((acc, order) => acc + (order.status !== "İptal" ? order.totalAmount : 0), 0);
    const pendingCount = orders.filter(o => o.status === "Sipariş Alındı" || o.status === "Hazırlanıyor").length;
    const cancelRequestCount = orders.filter(o => o.status === "İptal Talebi").length;
    const completedCount = orders.filter(o => o.status === "Teslim Edildi").length;
    
    const totalLoss = orders.reduce((acc, order) => {
        if (order.status === "İptal") return acc;
        const rawTotal = order.rawTotal || order.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        const realCost = rawTotal + order.deliveryFee;
        const loss = realCost - order.totalAmount;
        return acc + (loss > 0 ? loss : 0);
    }, 0);
    
    return { totalRevenue, pendingCount, cancelRequestCount, completedCount, totalLoss };
  }, [orders]);

  // 3. Filtreleme
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) || order.recipient.name.toLowerCase().includes(searchTerm.toLowerCase());
      let matchesStatus = true;
      if (statusFilter === "Zarar Edenler") {
          const rawTotal = order.rawTotal || order.items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
          const realCost = rawTotal + order.deliveryFee;
          matchesStatus = (realCost > order.totalAmount) && (order.status !== "İptal");
      } else if (statusFilter !== "Tümü") {
          matchesStatus = order.status === statusFilter;
      }
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // 4. Durum Güncelleme
  const handleStatusChange = async (e, id) => {
    e.stopPropagation();
    const st = e.target.value;
    try {
      await userRequest.put(`/orders/${id}`, { status: st });
      notify(`Sipariş güncellendi: ${st}`, "success");
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: st } : o));
    } catch (err) { notify("Hata", "error"); }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in pb-20">
      
      {/* BAŞLIK */}
      <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-6">
        <div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 drop-shadow-sm">Sipariş Yönetimi</h2>
            <p className="text-gray-500 font-medium text-sm flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>Platform üzerindeki tüm siparişlerin anlık durumu.</p>
        </div>
        <button onClick={() => { setLoading(true); fetchOrders(); }} className="bg-white text-blue-600 hover:bg-blue-50 border border-blue-100 px-6 py-3 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all duration-300 transform active:scale-95 flex items-center gap-2"><FiRefreshCw className={loading ? "animate-spin" : ""} /> Yenile</button>
      </div>

      {/* İSTATİSTİKLER */}
      <OrderStats stats={stats} setStatusFilter={setStatusFilter} />

      {/* FİLTRELER */}
      <OrderFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} statusFilter={statusFilter} setStatusFilter={setStatusFilter} />

      {/* LİSTE */}
      <div className="space-y-4">
        {filteredOrders.length === 0 && !loading ? (
           <div className="text-center py-20 text-gray-400 border-2 border-dashed rounded-3xl bg-white">Kriterlere uygun sipariş bulunamadı.</div>
        ) : (
           filteredOrders.map(order => (
             <OrderCard 
               key={order._id} 
               order={order} 
               isExpanded={expandedOrderId === order._id} 
               onToggle={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
               onStatusChange={handleStatusChange}
               onInvoiceClick={setSelectedInvoice}
             />
           ))
        )}
      </div>
      
      {selectedInvoice && <InvoiceModal order={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}
    </div>
  );
};

export default AdminOrders;