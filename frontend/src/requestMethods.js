import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/";

export const publicRequest = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Cookie gönderimi için şart
});

export const userRequest = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Cookie gönderimi için şart
});

// 1. İSTEK GİDERKEN (Interceptor)
userRequest.interceptors.request.use(
  (config) => {
    // LocalStorage'dan Access Token'ı al
    // Not: Artık sadece AccessToken'ı tutuyoruz, user detaylarını değil
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.accessToken) {
      config.headers.Authorization = `Bearer ${user.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. CEVAP DÖNDÜĞÜNDE (Interceptor - Sihirli Kısım)
userRequest.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Eğer hata 401 veya 403 ise VE bu isteği daha önce denemediysek
    if ((error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true; // Sonsuz döngüye girmesin diye işaretle

      try {
        // 1. Refresh Token ile yeni Access Token iste
        // (Cookie otomatik gider, body göndermeye gerek yok)
        const res = await publicRequest.post("/auth/refresh");
        const newAccessToken = res.data.accessToken;

        // 2. LocalStorage'ı güncelle
        const user = JSON.parse(localStorage.getItem("user"));
        user.accessToken = newAccessToken;
        localStorage.setItem("user", JSON.stringify(user));

        // 3. Yeni token'ı başarısız olan isteğe ekle
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // 4. İsteği tekrarla
        return userRequest(originalRequest);

      } catch (refreshError) {
        // Refresh token da ölmüşse (7 gün geçmişse) -> ÇIKIŞ YAP
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);