const { createClient } = require("redis");
require("dotenv").config();

let redisClient;

// 1. Eğer .env dosyasında REDIS_URL yoksa hiç bağlanmaya çalışma (Hata vermesin)
if (!process.env.REDIS_URL) {
  console.warn("⚠️ REDIS_URL bulunamadı. Caching (Önbellek) devre dışı bırakıldı.");
  
  // Fake (Sahte) bir client oluştur ki diğer dosyalar .get veya .set çağırdığında patlamasın
  redisClient = {
    connect: async () => {},
    on: () => {},
    get: async () => null,
    set: async () => {},
    del: async () => {},
    isOpen: false
  };

} else {
  // 2. Redis URL varsa Client'ı oluştur
  redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
      // Bağlantı koparsa siteyi kilitleme, belirli aralıklarla tekrar dene
      reconnectStrategy: (retries) => {
        if (retries > 5) {
          console.log("Redis bağlantısı kurulamadı, vazgeçiliyor...");
          return new Error("Redis retry exhausted");
        }
        return Math.min(retries * 50, 1000);
      },
    },
  });

  // Hata olursa (Örneğin çalışma anında koparsa) sunucuyu durdurma, sadece log bas
  redisClient.on("error", (err) => {
    // console.error komutunu kapattık ki logları kirletmesin, istersen açabilirsin
    // console.error("❌ Redis Client Error (Non-fatal)", err.message);
  });

  redisClient.on("connect", () => console.log("✅ Redis Connected!"));

  // 3. Bağlantıyı Güvenli Başlat (Uygulamayı çökertmeden)
  (async () => {
    try {
      await redisClient.connect();
    } catch (err) {
      console.warn("⚠️ Redis sunucusuna bağlanılamadı. Uygulama Redis olmadan çalışmaya devam ediyor.");
    }
  })();
}

module.exports = redisClient;