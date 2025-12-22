const router = require('express').Router();
const Product = require('../models/Product');

router.get('/sitemap.xml', async (req, res) => {
  try {
    const products = await Product.find();
    
    // GÜNCELLEME: Doğru domain adresi burada ayarlandı.
    const domain = process.env.CLIENT_URL || "https://fesfu.co.uk"; 

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url><loc>${domain}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
      <url><loc>${domain}/about</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
      <url><loc>${domain}/contact</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
      <url><loc>${domain}/faq</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
      
      ${products.map(prod => `
        <url>
          <loc>${domain}/product/${prod._id}</loc>
          <lastmod>${new Date(prod.updatedAt).toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.9</priority>
        </url>
      `).join('')}
    </urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error("Sitemap Hatası:", err);
    res.status(500).end();
  }
});

module.exports = router;