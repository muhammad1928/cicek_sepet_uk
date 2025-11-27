import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  
  // 1. SEPETİ YÜKLE
  const [cart, setCart] = useState(() => {
    try {
      const storedCart = localStorage.getItem("cart");
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (e) {
      console.error("Sepet yüklenemedi", e);
      return [];
    }
  });

  // 2. FAVORİLERİ YÜKLE
  const [favorites, setFavorites] = useState(() => {
    try {
      const storedFavs = localStorage.getItem("favorites");
      return storedFavs ? JSON.parse(storedFavs) : [];
    } catch (e) { return []; }
  });

  // GLOBAL STATE'LER
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Bildirim Sistemi (Toast.jsx ile uyumlu)
  const [notification, setNotification] = useState(null);
  const [notificationType, setNotificationType] = useState("success");
  
  const [searchTerm, setSearchTerm] = useState("");

  // KALICILIK (Persistence)
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    if (cart.some(item => item.quantity <= 0)) {
       setCart(prev => prev.filter(item => item.quantity > 0));
    }
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // --- YARDIMCI FONKSİYONLAR ---

  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Bildirim Göster
  const notify = (msg, type = "success") => {
    setNotification(msg);
    setNotificationType(type);
    // Otomatik kapatma (Opsiyonel ama iyi olur)
    setTimeout(() => setNotification(null), 3000);
  };
  
  const closeNotification = () => setNotification(null);

  // --- SEPET İŞLEMLERİ ---

  // 1. EKLEME
  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item._id === product._id);
    const itemStock = product.stock || Infinity;

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > itemStock) {
        notify(`Stok yetersiz! Maksimum: ${itemStock}`, 'error');
        return;
      }
      setCart(cart.map(item => 
        item._id === product._id ? { ...item, quantity: newQuantity } : item
      ));
    } else {
      if (quantity > itemStock) {
         notify(`Stok yetersiz!`, 'error');
         return;
      }
      setCart([...cart, { ...product, quantity }]);
    }
    
    notify(`${product.title} sepete eklendi!`, 'success');
  };

  // 2. SİLME
  const removeFromCart = (id, title) => {
    setCart(cart.filter(item => item._id !== id));
    if (title) notify(`${title} silindi.`, 'error'); // Kırmızı uyarı
  };

  // 3. TEMİZLEME
  const clearCart = () => {
    setCart([]);
    notify('Sepet temizlendi.', 'warning'); // Sarı uyarı
  };

  // 4. ARTIRMA (Bildirim Eklendi)
  const increaseQuantity = (id, title, stock) => {
    setCart(cart.map(item => {
      if (item._id === id) {
        const newQuantity = item.quantity + 1;
        if (newQuantity > stock) {
          notify(`Maksimum stok limitine ulaşıldı!`, 'error');
          return item;
        }
        notify(`${title} +1 eklendi`, 'success'); // <--- BİLDİRİM
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  // 5. AZALTMA (Bildirim Eklendi)
  const decreaseQuantity = (id, title) => {
    notify(`${title} -1 azaltıldı`, 'warning'); // <--- BİLDİRİM
    
    setCart(cart.map(item => 
      item._id === id ? { ...item, quantity: item.quantity - 1 } : item
    ).filter(item => item.quantity > 0));
  };

  // 6. GÜNCELLEME (Input)
  const updateItemQuantity = (id, newQuantity, stock, title) => {
     if (newQuantity > stock) {
        notify(`Stok yetersiz! Max: ${stock}`, 'error');
        newQuantity = stock;
     }
     if (newQuantity <= 0) {
        removeFromCart(id, title);
        return;
     }
     
     notify(`${title} adedi güncellendi: ${newQuantity}`, 'success'); // <--- BİLDİRİM
     
     setCart(cart.map(item =>
        item._id === id ? { ...item, quantity: newQuantity } : item
     ));
  };
  
  // --- FAVORİ İŞLEMLERİ ---
  const toggleFavorite = async (productId) => {
    const user = JSON.parse(localStorage.getItem("user"));
    
    // Giriş yapmamışsa
    if (!user) {
       if (favorites.includes(productId)) {
         setFavorites(prev => prev.filter(id => id !== productId));
         notify("Favorilerden çıkarıldı (Yerel)", "warning");
       } else {
         setFavorites(prev => [...prev, productId]);
         notify("Favorilere eklendi (Giriş yaparsanız kaydedilir)", "success");
       }
       return;
    }

    try {
      await axios.put(`http://localhost:5000/api/users/${user._id}/favorites`, { productId });
      
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

  return (
    <CartContext.Provider value={{
      cart, setCart, addToCart, removeFromCart, clearCart, 
      increaseQuantity, decreaseQuantity, updateItemQuantity,
      totalPrice, isCartOpen, setIsCartOpen, 
      notify, notification, notificationType, closeNotification, // <--- TOAST İÇİN GEREKLİ
      favorites, toggleFavorite, 
      searchTerm, setSearchTerm
    }}>
      {children}
    </CartContext.Provider>
  );
};
