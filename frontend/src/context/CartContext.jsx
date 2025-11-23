import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios"; // Favoriler için gerekli

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // --- STATE'LER ---
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Bildirim Sistemi
  const [notification, setNotification] = useState(null);
  const [notificationType, setNotificationType] = useState("success");

  // --- BİLDİRİM FONKSİYONLARI ---
  const notify = (msg, type = "success") => {
    setNotification(msg);
    setNotificationType(type);
  };
  
  const closeNotification = () => setNotification(null);

  // --- FAVORİ SİSTEMİ ---
  // Kullanıcı giriş yapmışsa favorilerini çek
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      const fetchFavs = async () => {
        try {
          const res = await axios.get(`https://ciceksepeti-api-m8ir.onrender.com/api/users/${user._id}/favorites`);
          // Sadece ID listesini tutuyoruz
          setFavorites(res.data.map(item => item._id));
        } catch (err) { console.log(err); }
      };
      fetchFavs();
    }
  }, []);

  const toggleFavorite = async (productId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      notify("Favorilere eklemek için giriş yapmalısınız!", "warning");
      return;
    }

    try {
      await axios.put(`https://ciceksepeti-api-m8ir.onrender.com/api/users/${user._id}/favorites`, { productId });
      
      if (favorites.includes(productId)) {
        setFavorites(prev => prev.filter(id => id !== productId));
        notify("Favorilerden çıkarıldı", "error");
      } else {
        setFavorites(prev => [...prev, productId]);
        notify("Favorilere eklendi ❤️", "success");
      }
    } catch (err) {
      notify("İşlem başarısız", "error");
    }
  };

  // --- SEPET SİSTEMİ ---
  
  // Sepete Ekle
  const addToCart = (product, quantity = 1) => {
    if (product.stock < quantity) {
      notify(`Stok yetersiz! Max: ${product.stock}`, "error");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) {
          notify(`Stok sınırı aşıldı!`, "error");
          return prev;
        }
        notify(`${product.title} sayısı ${newQty} oldu`, "success");
        return prev.map((item) => item._id === product._id ? { ...item, quantity: newQty } : item);
      }
      notify(`${product.title} sepete eklendi`, "success");
      return [...prev, { ...product, quantity: quantity }];
    });
  };

  // Direkt Adet Güncelleme (Input ile)
  const updateItemQuantity = (id, newQuantity, stock, title) => {
    if (newQuantity > stock) {
      notify(`Stok sınırındasınız!`, "warning");
      // Maksimum stokta tut
      setCart((prev) => prev.map((item) => item._id === id ? { ...item, quantity: stock } : item));
      return;
    }
    if (newQuantity < 1) return; // 1'den aşağı inmesin (silme ayrı butonla)

    notify(`${title} güncellendi`, "success");
    setCart((prev) => prev.map((item) => 
      item._id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  // Arttır (+)
  const increaseQuantity = (id, title, stock) => {
    setCart((prev) => prev.map((item) => {
      if (item._id === id) {
        if (item.quantity + 1 > stock) {
          notify(`Maksimum stok sınırındasınız`, "error");
          return item;
        }
        notify(`${title} arttırıldı`, "success");
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    }));
  };

  // Azalt (-)
  const decreaseQuantity = (id, title) => {
    setCart((prev) => prev.map((item) => {
      if (item._id === id) {
        const newQty = item.quantity - 1;
        if (newQty > 0) notify(`${title} azaltıldı`, "error");
        return item.quantity > 1 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  // Tek Ürün Sil
  const removeFromCart = (id, title) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
    notify(`${title} silindi`, "error");
  };

  // Tüm Sepeti Sil (Clear All)
  const clearCart = () => {
    setCart([]);
    notify("Sepet tamamen temizlendi", "error");
  };

  // Toplam Tutar Hesapla
  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      // Sepet State & Fonksiyonları
      cart, setCart, addToCart, removeFromCart, clearCart,
      increaseQuantity, decreaseQuantity, updateItemQuantity,
      totalPrice, isCartOpen, setIsCartOpen,
      
      // Bildirim Sistemi
      notification, notificationType, notify, closeNotification,

      // Favori Sistemi
      favorites, toggleFavorite
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);