const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // 465 portu için true olmalı
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // DİKKAT: Google App Password olmalı
      },
      tls: {
        // Render gibi sunucularda sertifika hatasını önler
        rejectUnauthorized: false
      },
      // Bağlantı zaman aşımı (10 saniye)
      connectionTimeout: 10000, 
      // Mesaj gönderme zaman aşımı (10 saniye)
      socketTimeout: 10000 
    });

    await transporter.verify(); // Bağlantıyı test et

    await transporter.sendMail({
      from: `"CicekSepeti UK" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html,
    });

    console.log(`✅ Mail başarıyla gönderildi: ${email}`);

  } catch (error) {
    console.error("❌ Mail Gönderme Hatası:", error.message);
    // Hatayı fırlat ki auth.js yakalasın ve kullanıcıyı silsin!
    throw new Error("Mail gönderilemedi"); 
  }
};

module.exports = sendEmail;