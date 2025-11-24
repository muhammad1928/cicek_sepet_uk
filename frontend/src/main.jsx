import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { HelmetProvider } from 'react-helmet-async'; // <--- EKLENDİ

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider> {/* <--- SARMALA */}
      <App />
    </HelmetProvider>
  </React.StrictMode>,
)