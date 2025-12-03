const router = require('express').Router();
const sendEmail = require('../utils/sendEmail');

router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    // Yöneticiye (Sana) Gidecek Mail
    // process.env.EMAIL_USER senin .env dosyasındaki mail adresindir (gönderen).
    // Kendine mail attırıyorsun.
    const adminEmail = process.env.EMAIL_USER; 

    const emailContent = `
      <h3>Yeni İletişim Mesajı 📩</h3>
      <p><b>Gönderen:</b> ${name} (${email})</p>
      <p><b>Konu:</b> ${subject}</p>
      <p><b>Mesaj:</b></p>
      <div style="background:#f5f5f5; padding:15px; border-radius:5px;">${message}</div>
    `;

    await sendEmail(adminEmail, `İletişim Formu: ${subject}`, emailContent);
    
    res.status(200).json({ message: "Mesajınız iletildi!" });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;