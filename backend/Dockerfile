# 1. En güncel LTS sürümü olan Node 24 (Alpine - Hafif Sürüm) kullanıyoruz
FROM node:24-alpine

# 2. Çalışma klasörünü ayarla
WORKDIR /app

# 3. Önce sadece paket listesini kopyala (Cache avantajı için)
COPY package*.json ./

# 4. Paketleri yükle (Tüm bağımlılıklar)
RUN npm install

# 5. Kalan tüm proje dosyalarını kopyala
COPY . .

# 6. Google Cloud Run için Port tanımla
ENV PORT=8080
EXPOSE 8080

# 7. Uygulamayı başlat (Backend'de build yoktur, direkt start edilir)
CMD ["npm", "start"]