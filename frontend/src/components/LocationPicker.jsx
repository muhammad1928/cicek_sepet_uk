import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css"; // CSS İmportu (Hata almamak için)

// Leaflet varsayılan ikon hatasını düzeltme (Webpack/Vite uyumu için)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationPicker = ({ onSelect }) => {
  const [position, setPosition] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  const MapEvents = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        setPosition(e.latlng);
        setLoadingAddress(true);
        
        try {
          // Açık adres bulma (Reverse Geocoding - OpenStreetMap)
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          
          // Adresi üst bileşene gönder
          if (onSelect) {
            onSelect(data.display_name || `${lat}, ${lng}`);
          }
        } catch (error) {
          console.error("Adres bulunamadı:", error);
          if (onSelect) onSelect(`${lat}, ${lng}`);
        } finally {
          setLoadingAddress(false);
        }
      },
    });
    return null;
  };

  return (
    <div className="space-y-2 w-full">
      <label className="text-xs font-bold text-gray-500 uppercase ml-1">Konum İşaretle</label>
      
      <div className="h-64 w-full rounded-xl overflow-hidden border-2 border-gray-200 relative z-0 shadow-sm group hover:border-blue-400 transition">
        <MapContainer 
          center={[51.505, -0.09]} // Başlangıç: Londra
          zoom={13} 
          scrollWheelZoom={false} 
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {position && <Marker position={position} />}
          <MapEvents />
        </MapContainer>

        {/* Bilgi Rozeti */}
        <div className="absolute bottom-2 right-2 bg-white/90 px-3 py-1 text-[10px] font-bold text-gray-600 rounded shadow z-[1000] backdrop-blur-sm">
          {loadingAddress ? "Adres alınıyor..." : position ? "Konum Seçildi ✅" : "Haritaya tıklayarak konum seçin 📍"}
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;