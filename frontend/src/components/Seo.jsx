import { Helmet } from 'react-helmet-async';

const Seo = ({ title, description, keywords, noindex }) => {
  return (
    <Helmet>
      <title>{title} | ÇiçekSepeti UK</title> {/* page name */}
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* --- GİZLİLİK AYARI --- */}
      {/* noindex true ise Google'a "Bunu görmezden gel" deriz */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Sosyal Medya Kartları */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
    </Helmet>
  );
};

export default Seo;