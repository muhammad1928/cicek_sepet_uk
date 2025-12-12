const { Resend } = require('resend');

// API Key yoksa (Localde test ederken hata vermesin diye) null kontrolü
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null;

const sendEmail = async (to, subject, html) => {
  try {
    if (!resend) {
        console.log("⚠️ RESEND_API_KEY eksik! Mail gönderilemedi (Simülasyon).");
        return;
    }

    // Domain Doğrulaması Yaptıysan: 'noreply@senindomainin.com'
    // Yapmadıysan (Test): 'onboarding@resend.dev' kullanmalısın.
    const fromEmail = process.env.EMAIL_USER || 'onboarding@resend.dev';

    const data = await resend.emails.send({
      from: `Fesfu Flowers UK <${fromEmail}>`,
      to: to, // Test modunda sadece kendi mailine atabilirsin!
      subject: subject,
      html: html,
    });

    if (data.error) {
        console.error("Resend Hatası:", data.error);
        throw new Error(data.error.message);
    }

    console.log(`✅ Mail başarıyla gönderildi (ID: ${data.id})`);
    return true;

  } catch (error) {
    console.error("❌ Mail Gönderme Hatası:", error.message);
    // Hatayı fırlat ki auth.js yakalayıp kullanıcıyı silsin
    throw new Error("Mail gönderilemedi"); 
  }
};

module.exports = sendEmail;