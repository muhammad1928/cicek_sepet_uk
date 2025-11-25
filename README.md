# 🌸 ÇiçekSepeti UK - Full Stack Pazaryeri Platformu

ÇiçekSepeti UK, çok satıcılı (multi-vendor) yapıyı destekleyen, kurye takip sistemi, gelişmiş sipariş yönetimi ve güvenli ödeme altyapısına sahip modern bir e-ticaret platformudur.

## 🚀 Özellikler

### 🛍️ Müşteri Paneli
- **Gelişmiş Arama & Filtreleme:** Kategori ve isme göre anlık arama.
- **Sepet & Ödeme:** Stripe entegrasyonu ile güvenli ödeme, kupon kodu kullanımı.
- **Favoriler:** Beğenilen ürünleri kaydetme.
- **Sipariş Takibi:** Sipariş durumunu anlık izleme (Hazırlanıyor, Yola Çıktı, Teslim Edildi).
- **Profil Yönetimi:** Adres defteri, şifre değiştirme ve geçmiş siparişler.
- **E-Posta Bildirimleri:** Sipariş onayı ve kargo durum güncellemeleri.

### 🏪 Satıcı (Vendor) Paneli
- **Ürün Yönetimi:** Resim yükleme, stok takibi, ürün ekleme/silme.
- **Sipariş Yönetimi:** Gelen siparişleri hazırlama ve kuryeye teslim etme.
- **Finans:** Satış ve ciro raporları.
- **Fatura:** Siparişler için otomatik fatura yazdırma.

### 🛵 Kurye Paneli
- **İş Havuzu:** Hazır olan siparişleri görüntüleme ve üzerine alma.
- **Teslimat:** Teslim alınan siparişi müşteriye ulaştırma ve onaylama.
- **Kazanç:** Yapılan teslimatlara göre hakediş takibi.

### 👮‍♂️ Yönetici (Admin) Paneli
- **Genel Bakış (Dashboard):** Toplam ciro, sipariş, üye ve ürün istatistikleri.
- **Kullanıcı Yönetimi:** Üyeleri engelleme, rol değiştirme (Müşteri -> Satıcı/Kurye).
- **Başvuru Onayı:** Satıcı ve Kurye başvurularını inceleme (Belge kontrolü) ve onaylama/reddetme.
- **Kupon Yönetimi:** İndirim kodları oluşturma.

## 🛠️ Teknolojiler

**Frontend:**
- React (Vite)
- Tailwind CSS (Tasarım)
- Axios (API İstekleri)
- React Router DOM (Yönlendirme)
- React Icons (İkon Seti)

**Backend:**
- Node.js & Express.js
- MongoDB Atlas (Veritabanı)
- Mongoose (ODM)
- JWT (Kimlik Doğrulama)
- BcryptJS (Şifreleme)
- Nodemailer (E-Posta Servisi)
- Cloudinary (Resim Depolama)
- Stripe (Ödeme Sistemi)

## ⚙️ Kurulum

Projeyi yerel makinenizde çalıştırmak için şu adımları izleyin:

1.  **Depoyu Klonlayın:**
    ```bash
    git clone [https://github.com/muhammad1928/cicek_sepet_uk.git](https://github.com/muhammad1928/cicek_sepet_uk.git)
    cd ciceksepeti-uk
    ```

2.  **Bağımlılıkları Yükleyin:**
    *Backend için:*
    ```bash
    cd backend
    npm install
    ```
    *Frontend için:*
    ```bash
    cd ../frontend
    npm install
    ```

3.  **Çevre Değişkenlerini (.env) Ayarlayın:**
    `backend` klasörü içine `.env` dosyası oluşturun ve şu bilgileri girin:
    ```env
    MONGO_URI=mongodb+srv://...
    JWT_SEC=gizlisifreniz
    STRIPE_KEY=sk_test_...
    
    # Cloudinary (Resim Yükleme)
    CLOUDINARY_CLOUD_NAME=...
    CLOUDINARY_API_KEY=...
    CLOUDINARY_API_SECRET=...

    # Nodemailer (E-Posta)
    EMAIL_USER=mailiniz@gmail.com
    EMAIL_PASS=uygulama_sifresi
    ```

4.  **Projeyi Başlatın:**
    *Backend:* `cd backend` -> `npx nodemon server.js`
    *Frontend:* `cd frontend` -> `npm run dev`

## 🌐 Canlı Demo
Proje şu an yayında değildir (veya link buraya eklenebilir).

---
*Sodiq*