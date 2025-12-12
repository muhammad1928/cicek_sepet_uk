# --- AŞAMA 1: BUILD ---
# En güncel Node 24 sürümünü kullanıyoruz
FROM node:24-alpine as build
WORKDIR /app

# Paketleri yükle
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Tüm dosyaları kopyala
COPY . .

# Build işlemini başlat (Vite otomatik olarak .env.production dosyasını okur)
RUN npm run build

# --- AŞAMA 2: SERVE (NGINX) ---
FROM nginx:alpine

# Build edilen dosyaları Nginx klasörüne taşı
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx ayar dosyasını kopyala
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]