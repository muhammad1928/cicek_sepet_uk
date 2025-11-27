import { useState, useEffect } from "react";
import axios from "axios";

const SecureImage = ({ src, alt, className, ...props }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      if (!src) return;
      
      // Kullanıcı Token'ını Al
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.accessToken;

      try {
        // Backend Proxy'sine İstek At (Token Header'da gidiyor)
        const response = await axios.get(`http://localhost:5000/api/upload/secure-image?url=${encodeURIComponent(src)}`, {
          headers: { token: `Bearer ${token}` },
          responseType: 'blob' // Resim verisi olarak al
        });

        // Gelen veriyi tarayıcının anlayacağı URL'e çevir
        const objectUrl = URL.createObjectURL(response.data);
        setImageSrc(objectUrl);
      } catch (err) {
        console.error("Resim yüklenemedi:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();

    // Temizlik (Bellek sızıntısını önle)
    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
    };
  }, [src]);

  if (loading) return <div className={`bg-gray-200 animate-pulse flex items-center justify-center text-xs text-gray-400 ${className}`}>Yükleniyor...</div>;
  if (error) return <div className={`bg-red-50 border border-red-200 flex items-center justify-center text-red-500 text-xs p-2 ${className}`}>Görüntülenemedi</div>;

  return <img src={imageSrc} alt={alt} className={className} {...props} />;
};

export default SecureImage;