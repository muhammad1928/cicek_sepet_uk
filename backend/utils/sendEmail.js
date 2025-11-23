const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, htmlContent) => {
  try {
    // 1. Postacı Ayarları (Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Senin mailin
        pass: process.env.EMAIL_PASS, // Uygulama şifresi
      },
    });

    // 2. Mektup Detayları
    const mailOptions = {
      from: '"ÇiçekSepeti UK" <no-reply@ciceksepeti.uk>', // Gönderen adı
      to: to, // Alıcı
      subject: subject, // Konu
      html: htmlContent, // İçerik (HTML formatında)
    };

    // 3. Gönder
    await transporter.sendMail(mailOptions);
    console.log("E-posta gönderildi: " + to);
    
  } catch (error) {
    console.log("Mail Gönderme Hatası:", error);
  }
};

module.exports = sendEmail;