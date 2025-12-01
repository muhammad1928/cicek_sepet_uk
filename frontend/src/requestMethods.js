import axios from "axios";

// Canlıya geçince burayı değiştireceğiz. Şimdilik localhost kalsın.
const BASE_URL = "http://localhost:5000/api/";

// 1. TOKEN GEREKMEYEN İŞLEMLER İÇİN (Ürünleri listeleme, Login olma vb.)
export const publicRequest = axios.create({
  baseURL: BASE_URL,
});

// 2. TOKEN GEREKTİREN İŞLEMLER İÇİN (Sipariş verme, Sepet, Admin paneli)
export const userRequest = axios.create({
  baseURL: BASE_URL,
});

// Her istekten önce Token'ı otomatik ekleyen "Interceptor" (Bekçi)
userRequest.interceptors.request.use((config) => {
  // LocalStorage'dan kullanıcıyı bul
  const user = JSON.parse(localStorage.getItem("user"));
  
  // Eğer kullanıcı varsa ve token'ı varsa Header'a ekle
  if (user && user.accessToken) {
    config.headers.token = `Bearer ${user.accessToken}`;
  }
  return config;
});