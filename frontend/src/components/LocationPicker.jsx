import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import axios from "axios";
import L from "leaflet";

// Leaflet varsayılan ikon hatasını düzeltme
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// --- 1. GRİ ALAN SORUNU ÇÖZÜCÜ (TAMİRCİ) ---
// Bu bileşen harita yüklendiğinde otomatik olarak "Yenilen!" komutu verir.
const MapFix = () => {
  const map = useMap();
  useEffect(() => {
    // Harita yüklendikten 100ms sonra boyutunu tekrar hesapla
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

// --- 2. KONUM SEÇİCİ (TIKLAMA İŞLEYİCİ) ---
const LocationMarker = ({ setPos, onSelect }) => {
  const map = useMap();
  
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPos([lat, lng]);
      map.flyTo([lat, lng], map.getZoom()); // Tıklanan yere uç

      // Ters Geocoding (Koordinattan Adres Bulma - OpenStreetMap)
      axios
        .get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then((res) => {
          if (res.data && res.data.display_name) {
            // Adresi üst bileşene gönder
            onSelect(res.data.display_name); 
          }
        })
        .catch((err) => console.error("Adres bulunamadı:", err));
    },
  });

  return null;
};

const LocationPicker = ({ onSelect }) => {
  // Varsayılan Konum: Londra Merkezi (Değiştirebilirsin)
  const [position, setPosition] = useState([51.505, -0.09]);

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200 relative z-0">
      {/* z-0 önemli: Harita diğer elementlerin üstüne çıkmasın */}
      
      <MapContainer 
        center={position} 
        zoom={13} 
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false} // Sayfa kayarken harita zoom yapmasın
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Marker (Pin) */}
        <Marker position={position}></Marker>

        {/* --- TAMİRCİLER --- */}
        <MapFix /> 
        <LocationMarker setPos={setPosition} onSelect={onSelect} />
      
      </MapContainer>
      
      <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-[10px] text-gray-500 font-bold shadow-sm z-[400] pointer-events-none">
        Konum Seçmek İçin Haritaya Tıkla 📍
      </div>
    </div>
  );
};

export default LocationPicker;