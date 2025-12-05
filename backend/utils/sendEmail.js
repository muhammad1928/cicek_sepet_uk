const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, html) => {
  try {
    // Gmail için en güvenilir Production ayarı (Port 465 + SSL)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // 465 için true olmalı
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // DİKKAT: Burası Google App Password olmalı!
      },
      // Render/Cloud sunucularında bazen TLS sertifika sorunu olur, bunu aşmak için:
      tls: {
        rejectUnauthorized: false
      },
      // 10 saniye içinde bağlanamazsa hata ver (Sonsuza kadar beklemesin)
      connectionTimeout: 10000 
    });

    // Maili gönder
    await transporter.sendMail({
      from: `"ÇiçekSepeti UK" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html,
    });

    console.log(`✅ Mail başarıyla gönderildi: ${email}`);
    return true;

  } catch (error) {
    console.error("❌ Mail Gönderme Hatası:", error.message);
    // ÖNEMLİ: Hatayı auth.js'e geri fırlat ki kullanıcıyı silsin!
    throw new Error("Mail gönderilemedi"); 
  }
};

module.exports = sendEmail;