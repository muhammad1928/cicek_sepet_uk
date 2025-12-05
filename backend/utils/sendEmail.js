const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587, // <--- 465 yerine 587
      secure: false, // <--- 587 için false olmalı (STARTTLS kullanır)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Google App Password
      },
      tls: {
        rejectUnauthorized: false // Sertifika hatalarını yoksay
      },
      connectionTimeout: 20000, // 20 Saniye bekleme süresi
      socketTimeout: 20000
    });

    // Bağlantıyı Test Et (Opsiyonel ama iyi olur)
    // await transporter.verify(); 

    await transporter.sendMail({
      from: `"CicekSepeti UK" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: html,
    });

    console.log(`✅ Mail başarıyla gönderildi: ${email}`);

  } catch (error) {
    console.error("❌ Mail Gönderme Hatası:", error.message);
    // Hatayı fırlat ki auth.js yakalasın
    throw new Error("Mail gönderilemedi"); 
  }
};

module.exports = sendEmail;