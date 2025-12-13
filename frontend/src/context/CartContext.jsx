import React, { createContext, useContext, useState, useEffect, useMemo } from "react"; // useMemo eklendi
import { useTranslation } from "react-i18next";
import { userRequest } from "../requestMethods"; // Merkezi Request Metotları

const CartContext = createContext();

const initialCart = JSON.parse(localStorage.getItem("cart")) || [];
const initialFavorites = JSON.parse(localStorage.getItem("favorites")) || [];

export const CartProvider = ({ children }) => {
  const { t } = useTranslation();
  // --- STATE TANIMLARI ---
  const [cart, setCart] = useState(initialCart);
  const [favorites, setFavorites] = useState(initialFavorites);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [notificationType, setNotificationType] = useState("success");
  const [searchTerm, setSearchTerm] = useState("");
  
  // KRİTİK EKSİK: user objesi
  const [user, setUser] = useState(null);

  // --- KULLANICI DURUMU SENKRONİZASYONU ---
  // --- KULLANICI & FAVORİ SENKRONİZASYONU (GÜNCELLENDİ) ---
  useEffect(() => {
    const syncUserData = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);

      // EĞER KULLANICI VARSA FAVORİLERİ DB'DEN ÇEK
      if (storedUser && storedUser._id && storedUser.accessToken) {
        try {
          const res = await userRequest.get(`/users/${storedUser._id}/favorites`);
          setFavorites(res.data);
          localStorage.setItem("favorites", JSON.stringify(res.data));
        } catch (err) {
          // Eğer 401 hatası alırsak (Token geçersizse) sessizce favorileri boşalt
          // Zaten Axios Interceptor kullanıcıyı logout yapacak veya token yenileyecek.
          if (err.response && err.response.status === 401) {
             console.log("Oturum süresi dolmuş, favoriler yüklenemedi.");
             // İsteğe bağlı: setFavorites([]); 
          } else {
             console.error("Favori çekme hatası:", err);
          }
        }
      }
    };
    
    syncUserData();
    window.addEventListener('user-change', syncUserData);
    return () => window.removeEventListener('user-change', syncUserData);
  }, []);

  // Sepeti dışarıdan açmak için event listener
  useEffect(() => {
    const openCartHandler = () => {
      setTimeout(() => setIsCartOpen(true), 500);
    };
    
    window.addEventListener('open-cart', openCartHandler);
    return () => window.removeEventListener('open-cart', openCartHandler);
  }, []);

  // --- KALICILIK (Persistence) ---
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    // Miktar kontrolü (0 olanları temizle)
    if (cart.some(item => item.quantity <= 0)) {
      setCart(prev => prev.filter(item => item.quantity > 0));
    }
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // --- HESAPLAMALAR (useMemo ile Optimize) ---
  const totalPrice = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);


  // --- YARDIMCI FONKSİYONLAR ---
  const notify = (msg, type = "success") => {
    setNotification(msg);
    setNotificationType(type);
  };
  const closeNotification = () => setNotification(null);

  // 1. EKLEME
  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find(item => item._id === product._id);
    const itemStock = product.stock || Infinity;

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > itemStock) {
        notify(`${t('cartContext.maxStockReached')}: ${itemStock}`, 'error');
        return;
      }
      setCart(cart.map(item => item._id === product._id ? { ...item, quantity: newQuantity } : item));
    } else {
      if (quantity > itemStock) { notify(`${t('cartContext.maxStockReached')}: ${itemStock}`, 'error'); return; }
      setCart([...cart, { ...product, quantity }]);
    }
    notify(`${product.title} ${t('cartContext.added')}`, 'success');
  };

  // 2. SİLME
  const removeFromCart = (id, title) => {
    setCart(cart.filter(item => item._id !== id));
    if (title) notify(`${title} ${t('cartContext.removed')}`, 'error');
  };

  // 3. TEMİZLEME
  const clearCart = () => {
    setCart([]);
    notify(t('cartContext.cartEmpty'), 'warning');
  };

  // 4. ARTIRMA
  const increaseQuantity = (id, title, stock) => {
    setCart(cart.map(item => {
      if (item._id === id) {
        if (item.quantity + 1 > stock) {
          notify(`${t('cartContext.maxLimitReached')}`, 'error');
          return item;
        }
        notify(`${title} ${t('cartContext.increased')}`, 'success'); 
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    }));
  };

  // 5. AZALTMA
  const decreaseQuantity = (id, title) => {
    notify(`${title} ${t('cartContext.decreased')}`, 'warning');
    setCart(cart.map(item => 
      item._id === id ? { ...item, quantity: item.quantity - 1 } : item
    ).filter(item => item.quantity > 0));
  };

  // 6. GÜNCELLEME (Input)
  const updateItemQuantity = (id, newQuantity, stock, title) => {
      if (newQuantity > stock) { notify(`${t('cartContext.maxStockReached')} ${stock}`, 'error'); newQuantity = stock; }
      if (newQuantity <= 0) { removeFromCart(id, title); return; }
      
      notify(`${title} ${t('cartContext.updated')}: ${newQuantity}`, 'success');
      
      setCart(cart.map(item => item._id === id ? { ...item, quantity: newQuantity } : item));
  };
  
  // 7. FAVORİ EKLE/SİLME
  const toggleFavorite = async (productId) => {
  const isCurrentlyFav = favorites.includes(productId);
  
  if (user) {
    try {
      const res = await userRequest.put(`/users/${user._id}/favorites`, { productId });
      setFavorites(res.data); 
      notify(
        isCurrentlyFav ? t('cartContext.deletedFromFavorites') + " ❌" : t('cartContext.addedToFavorites') + " ❤️", 
        isCurrentlyFav ? "error" : "success"
      );
      return; 
    } catch (e) {
      notify(t('cartContext.favoritesNotUpdated'), "error");
      return; 
    }
  } 

  // Misafir kullanıcı
  let newFavorites;
  if (isCurrentlyFav) {
    newFavorites = favorites.filter(id => id !== productId);
  } else {
    newFavorites = [...favorites, productId];
  }
  setFavorites(newFavorites);
  notify(
    isCurrentlyFav ? t('cartContext.deletedFromFavorites') + " ❌" : t('cartContext.addedToFavorites') + " ❤️", 
    isCurrentlyFav ? "error" : "success"
  );
};

  const isFavorite = (productId) => favorites.includes(productId);


  return (
    <CartContext.Provider
      value={{
        cart, setCart, addToCart, removeFromCart, clearCart, 
        increaseQuantity, decreaseQuantity, updateItemQuantity,
        totalPrice, isCartOpen, setIsCartOpen, 
        notify, notification, notificationType, closeNotification,
        favorites, toggleFavorite, isFavorite,
        searchTerm, setSearchTerm,
        user, // User objesini tüm uygulamaya aç
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);