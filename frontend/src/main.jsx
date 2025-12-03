import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import 'leaflet/dist/leaflet.css';
import './i18n'; // <--- BU SATIRI EKLE (İMPORT ET)

// --- GÜVENLİK: PRODUCTION MODUNDA LOGLARI KAPAT ---
if (import.meta.env.MODE === 'production') {
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
  console.info = () => {};
}
// --------------------------------------------------

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)