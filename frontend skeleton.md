Frontend/
├── public/
│
│   ├── favicons/
│   │   ├── apple-touch-icon.png
│   │   ├── favicon-16x16.png
│   │   ├── favicon-32x32.png
│   │   └── favicon.ico
│   │
│   ├── robots.txt
│   └── vite.svg
│
├── src/
│   ├── assets/
│   │
│   ├── data/
│   │   ├──  regions.js
│   │   └──  categoryData.js
│   │
│   ├── components/
│   │   ├── admin/
│   │   │   ├── adminComponents/
│   │   │   │   └── AdminPanelHeader.jsx
│   │   │   │
│   │   │   ├── adminOrderComponents/
│   │   │   │   ├── OrderCard.jsx
│   │   │   │   ├── OrderFilters.jsx
│   │   │   │   ├── OrderMetadata.jsx
│   │   │   │   └── OrderStats.jsx
│   │   │   │
│   │   │   ├── adminUserComponents/
│   │   │   │   ├── RoleChangeModal.jsx
│   │   │   │   ├── UserDetailModal.jsx
│   │   │   │   ├── UserFilters.jsx
│   │   │   │   └── UserTable.jsx
│   │   │   │
│   │   │   ├── adminProductsComponent/
│   │   │   │   ├── ProductFilters.jsx
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   ├── ProductList.jsx
│   │   │   │   └── ProductForm.jsx
│   │   │   │
│   │   │   ├── AdminApplications.jsx
│   │   │   ├── AdminCoupons.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminOrders.jsx
│   │   │   ├── AdminProducts.jsx
│   │   │   ├── AdminReviews.jsx
│   │   │   ├── AdminUsers.jsx
│   │   │   ├── ApplicationDetailsModal.jsx
│   │   │   └── UserActivityModal.jsx
│   │   │
│   │   ├── cartSidebar/
│   │   │   ├── CartItemList.jsx
│   │   │   ├── CheckoutForm.jsx
│   │   │   ├── index.jsx
│   │   │   ├── SidebarFooter.jsx
│   │   │   └── SidebarHeader.jsx
│   │   │
│   │   ├── navbar/
│   │   │   ├── CartIcon.jsx
│   │   │   ├── constants.js
│   │   │   ├── LanguageSelector.jsx
│   │   │   ├── MobileMenu.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── UserActions.jsx
│   │   │
│   │   ├── profilePage/
│   │   │   ├── AddressBook.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── UserInfo.jsx
│   │   │
│   │   ├── vendor/
│   │   │   ├── VendorDashboard.jsx
│   │   │   ├── VendorOrders.jsx
│   │   │   ├── VendorProducts.jsx
│   │   │   └── VendorSettings.jsx
│   │   │
│   │   ├── productDetails/
│   │   │   ├── ProductActions.jsx
│   │   │   ├── ProductGallery.jsx
│   │   │   ├── ProductInfo.jsx
│   │   │   ├── PeoductReview.jsx
│   │   │   └── RelatedProducts.jsx
│   │   │
│   │   ├── BadgeDisplay.jsx
│   │   ├── CancelModal.jsx
│   │   ├── CartSidebar.jsx
│   │   ├── CategoryNav.jsx
│   │   ├── Chatbot.jsx
│   │   ├── ConfirmModal.jsx
│   │   ├── CookieBanner.jsx
│   │   ├── Features.jsx
│   │   ├── Footer.jsx
│   │   ├── InvoiceModal.jsx
│   │   ├── Loading.jsx
│   │   ├── LocationPicker.jsx
│   │   ├── Navbar.jsx
│   │   ├── OrderTracker.jsx
│   │   ├── ScrollToTop.jsx
│   │   ├── SecureImage.jsx
│   │   ├── Seo.jsx
│   │   ├── TermsModal.jsx
│   │   ├── Toast.jsx
│   │   ├── VerificationPending.jsx
│   │   └── WarningModal.jsx
│   │
│   ├── context/
│   │   ├── CartContext.jsx
│   │   └── faultyOldcart.js
│   │
│   ├── locales/
│   │   ├── de.json
│   │   ├── en.json
│   │   ├── es.json
│   │   ├── fr.json
│   │   ├── it.json
│   │   ├── nl.json
│   │   ├── sv.json
│   │   └── tr.json
│   │
│   ├── pages/
│   │   ├── customers/
│   │   │   (Bu klasör boş)
│   │   │
│   │   ├── partner/
│   │   │   ├── CourierPage.jsx
│   │   │   ├── PartnerApplicationPage.jsx
│   │   │   └── VendorPage.jsx
│   │   │
│   │   ├── AboutPage.jsx
│   │   ├── AdminPage.jsx
│   │   ├── ContactPage.jsx
│   │   ├── FaqPage.jsx
│   │   ├── FavoritesPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── LegalPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── MyOrdersPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   ├── ProductDetailPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── RegisterCourierPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── RegisterVendorPage.jsx
│   │   ├── ResetPasswordPage.jsx
│   │   ├── StorePage.jsx
│   │   ├── SuccessPage.jsx
│   │   └── VerifyEmailPage.jsx
│   │
│   ├── App.css
│   ├── App.jsx
│   ├── i18n.js
│   ├── index.css
│   ├── main.jsx
│   └── requestMethods.js
│
├── index.html
└── package.json (Proje kök dizinindeki)


backend/
├── models/                  # Veritabanı Şemaları (MongoDB/Mongoose)
│   ├── Cart.js              # Sepet verisi şeması
│   ├── Coupon.js            # İndirim kuponları şeması
│   ├── Log.js               # Log
│   ├── Order.js             # Sipariş kayıtları şeması
│   ├── Product.js           # Ürün bilgileri şeması
│   └── User.js              # Kullanıcı kayıtları şeması
│
├── routes/                  # API Uç Noktaları (Endpoints)
│   ├── auth.js              # Giriş/Kayıt (Login/Register) işlemleri
│   ├── cart.js              # Sepet işlemleri (Ekle/Sil)
│   ├── contact.js           # İletişim formu istekleri
│   ├── coupon.js            # Kupon doğrulama işlemleri
│   ├── order.js             # Sipariş oluşturma ve takibi
│   ├── payment.js           # Ödeme sistemi entegrasyonu (Stripe/Iyzico vb.)
│   ├── product.js           # Ürün listeleme, ekleme, güncelleme
│   ├── stats.js             # Admin paneli için istatistikler
│   ├── upload.js            # Resim yükleme işlemleri (Cloudinary/S3 vb.)
│   ├── users.js             # Kullanıcı profili yönetimi
│   ├── sitemap.js           # 
│   ├── log.js           # 
│   └── verifyToken.js       # Güvenlik katmanı (Middleware - JWT kontrolü)
│
├── utils/                   # Yardımcı Araçlar ve Fonksiyonlar
│   ├── emailTranslations.js # E-posta içerikleri için dil çevirileri
│   ├── logActivity.js       # Kullanıcı hareketlerini kaydetme
│   ├── logger.js            # Sistem loglarını tutma (Winston/Morgan vb.)
│   ├── redisClient.js       # Redis (Önbellek/Cache) bağlantısı
│   └── sendEmail.js         # Mail gönderme fonksiyonu (Nodemailer vb.)
│
├── .dockerignore            # Docker'ın görmezden geleceği dosyalar
├── .env                     # Hassas bilgiler (Şifreler, API Anahtarları)
├── .gcloudignore            # Google Cloud'a yüklenmeyecekler
├── Dockerfile               # Uygulamanın konteyner ayarları
├── package-lock.json        # Kütüphane versiyon kilit dosyası
├── package.json             # Proje ayarları ve bağımlılıklar
└── server.js                # ANA GİRİŞ DOSYASI (Uygulamayı başlatan dosya)



https://visa.vfsglobal.com/tur/tr/fra/login