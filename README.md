
# 🛍️ Fesfu UK - The Ultimate Marketplace Platform

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg?style=flat-square)
![Build Status](https://img.shields.io/badge/build-passing-success?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![Stack](https://img.shields.io/badge/stack-MERN-orange?style=flat-square)

**Fesfu UK**, Londra merkezli yeni nesil bir e-ticaret pazar yeridir. Geleneksel çiçek satışını modern teknoloji, moda, kitap ve gurme gıda ürünleriyle birleştirerek **"Her Şey İçin Tek Adres"** vizyonunu sunar.

Bu repo, **Yüksek Performanslı MERN Stack** mimarisi, **Redis Önbellekleme**, **Dinamik SEO** ve **Gelişmiş Güvenlik Katmanları** ile donatılmış tam kapsamlı bir e-ticaret motorudur.

🌐 **Canlı Proje:** [https://fesfu.co.uk](https://fesfu.co.uk)

---

## 🚀 Temel Özellikler

### 🛒 Pazar Yeri & E-Ticaret
* **Multi-Category Architecture:** Çiçek, Teknoloji, Kitap, Moda, Hediye Kartları ve Gıda için özelleştirilmiş veri yapıları.
* **Dinamik Stok Yönetimi:** Renk, beden ve varyant bazlı gerçek zamanlı stok takibi.
* **Akıllı Sepet Sistemi:** Otomatik fiyat hesaplama, kupon entegrasyonu ve sepeti hatırlama özelliği.
* **Vendor (Satıcı) Paneli:** Harici satıcıların kendi ürünlerini yükleyip yönetebildiği dashboard.
* **Kurye Takip Sistemi:** Siparişlerin gerçek zamanlı lojistik takibi.

### 🌐 Globalleşme & SEO
* **i18n Çoklu Dil Desteği:** 8 Dil (EN, TR, ES, FR, DE, IT, NL, SV) arasında anlık geçiş.
* **Advanced SEO:** `React Helmet Async` ile her sayfa için dinamik meta tag ve JSON-LD (Schema) üretimi.
* **Otomatik Sitemap:** Google için backend tarafında dinamik olarak oluşturulan `/sitemap.xml`.
* **Google Analytics 4 (GA4):** E-ticaret dönüşüm takibi (Purchase, Add to Cart eventleri).

### 🛡️ Güvenlik & Performans (Enterprise Level)
* **Rate Limiting (Redis):** DDoS saldırılarına karşı IP tabanlı istek sınırlama.
* **Security Headers:** `Helmet` ile HTTP başlık güvenliği.
* **Sanitization:** NoSQL Injection (mongo-sanitize) ve XSS (xss-clean) saldırılarına karşı koruma.
* **Parameter Pollution Protection:** `HPP` ile HTTP parametre kirliliği önleme.
* **Cloud Native:** Google Cloud Run üzerinde ölçeklenebilir mimari.

---

## 🛠️ Teknoloji Yığını (Tech Stack)

| Katman | Teknoloji | Açıklama |
| :--- | :--- | :--- |
| **Frontend** | React 18 (Vite) | Ultra hızlı build ve render performansı |
| **State** | React Context API | Global sepet ve kullanıcı durumu yönetimi |
| **UI Framework** | Tailwind CSS | Modern, responsive ve utility-first tasarım |
| **Backend** | Node.js & Express | RESTful API mimarisi |
| **Veritabanı** | MongoDB Atlas | Ölçeklenebilir NoSQL veritabanı |
| **Cache** | Redis | Rate limiting ve session yönetimi için |
| **Dosya Yönetimi** | Multer | Görsel yükleme ve optimizasyon |
| **Deployment** | Google Cloud Run | Serverless container deployment |

---

## 📂 Proje Mimarisi

```bash
fesfu-marketplace/
├── backend/                  # API Sunucusu
│   ├── models/               # Veritabanı Şemaları (User, Product, Order...)
│   ├── routes/               # API Endpoints (Auth, Cart, Payment...)
│   ├── utils/                # Yardımcı Araçlar (Logger, Redis Client...)
│   ├── server.js             # Ana Giriş Noktası (Security Middleware burada)
│   └── sitemap.js            # Dinamik Sitemap Üretici
│
├── Frontend/                 # React İstemci Uygulaması
│   ├── public/               # Statik Varlıklar
│   ├── src/
│   │   ├── components/       # UI Bileşenleri (Navbar, Footer, SEO...)
│   │   ├── pages/            # Sayfa Görünümleri (Home, ProductDetail...)
│   │   ├── context/          # State Yönetimi
│   │   ├── locales/          # Dil Çeviri Dosyaları (JSON)
│   │   └── requestMethods.js # Axios Yapılandırması
│   └── index.html            # GA4 ve Meta Tag Girişi

```

---

## ⚙️ Kurulum (Local Development)

Projeyi yerel ortamınızda güvenli bir şekilde çalıştırmak için aşağıdaki adımları izleyin.

### 1. Hazırlık

* Node.js (v16 veya üzeri)
* MongoDB (Yerel veya Cloud URL)
* Git

### 2. Depoyu Klonlayın

```bash
git clone [https://github.com/kullaniciadin/fesfu-marketplace.git](https://github.com/kullaniciadin/fesfu-marketplace.git)
cd fesfu-marketplace

```

### 3. Çevresel Değişkenleri Ayarlayın (ÖNEMLİ 🚨)

Güvenlik nedeniyle `.env` dosyaları repoda bulunmaz. Kök dizinlerde aşağıdaki dosyaları oluşturun.

**Backend için (`/backend/.env`):**

```env
PORT=5000
MONGO_URI=mongodb+srv://<db_user>:<password>@cluster.mongodb.net/fesfuDB
JWT_SEC=cok_gizli_jwt_anahtari
PASS_SEC=sifreleme_anahtari
CLIENT_URL=http://localhost:5173
NODE_ENV=development

```

**Frontend için (`/Frontend/.env`):**

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_KEY=pk_test_...

```

### 4. Bağımlılıkları Yükleyin ve Başlatın

**Backend:**

```bash
cd backend
npm install
npm start

```

**Frontend:**

```bash
cd Frontend
npm install
npm run dev

```

---

## 🔗 API Dokümantasyonu (Özet)

| Method | Endpoint | Açıklama | Erişim |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Yeni kullanıcı kaydı | Public |
| `POST` | `/api/auth/login` | Kullanıcı girişi (JWT döner) | Public |
| `GET` | `/api/products` | Tüm ürünleri filtreli listele | Public |
| `GET` | `/api/products/:id` | Tekil ürün detayı | Public |
| `POST` | `/api/cart` | Sepete ürün ekle | User |
| `POST` | `/api/orders` | Sipariş oluştur | User |
| `GET` | `/sitemap.xml` | Google için dinamik XML haritası | Public |

---

## 🛡️ Güvenlik Feragatnamesi (Disclaimer)

Bu proje, **OWASP** güvenlik standartları göz önünde bulundurularak geliştirilmiştir.

* **Veritabanı şifreleri** asla kod içine gömülmemiştir (Hardcoded değildir).
* **Hassas veriler** (kredi kartı vb.) veritabanında saklanmaz, ödeme sağlayıcı (Stripe) üzerinden işlenir.
* **XSS ve Injection** korumaları middleware seviyesinde aktiftir.

Eğer bir güvenlik açığı fark ederseniz, lütfen Issue açmak yerine doğrudan `security@fesfu.co.uk` adresine bildirin.

---

## 📧 İletişim

**Fesfu Tech Team** - London, UK

Website: [fesfu.co.uk](https://fesfu.co.uk)

---

<div align="center">
<sub>© 2025 Fesfu UK. All rights reserved.</sub>
</div>

```

### 🚀 Son Kontrol Listesi (GitHub'a Yüklemeden Önce)

Kodlarını yüklemeden önce terminalden şu iki komutu çalıştırıp kontrol etmeni istiyorum:

1.  **Backend klasöründe:** `.gitignore` dosyasını aç, içinde `.env` yazıyor mu?
2.  **Frontend klasöründe:** `.gitignore` dosyasını aç, içinde `.env` yazıyor mu?

Eğer ikisi de **EVET** ise, bu README ile birlikte projenizi GitHub'a yükleyebilirsiniz. Kimse şifrelerinize erişemez, ama herkes projenizin kalitesini görür.

```