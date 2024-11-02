import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useKioskService } from '../../../../Api/kioskService';

// Define type for kiosk data
interface Kiosk {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  accountID: number;
  openingHours: string;
  createdAt: string;
  updatedAt: string;
  status: boolean;
}

const Map: React.FC = () => {
  const { fetchAllKiosk } = useKioskService();
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const key = 'uoQDJZ1IqayiRy7cs3QA'; // Your API key
    const mapContainer = document.getElementById('map');

    if (!mapContainer) {
      console.error('Map container not found!');
      return;
    }

    const map = L.map(mapContainer).setView([21.0285, 105.8542], 6);

    L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${key}`, {
      tileSize: 512,
      zoomOffset: -1,
      minZoom: 1,
      crossOrigin: true,
    }).addTo(map);

    // Custom SVG icon for kiosks
    const kioskIcon = L.divIcon({
      className: 'custom-kiosk-icon',
      html: `
<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
  <rect width="25" height="41" fill="none"/>
  <path d="M 5 20 L 12.5 10 L 20 20" stroke="black" stroke-width="2" fill="none"/>
  <path d="M 5 20 L 5 30 L 20 30 L 20 20" stroke="black" stroke-width="2" fill="none"/>
</svg>


      `,
      iconSize: [25, 41], // Size of the icon
      iconAnchor: [12.5, 41], // Point of the icon which will correspond to marker's location
      popupAnchor: [0, -34], // Point from which the popup should open relative to the iconAnchor
    });

    const geocodeCache: { [address: string]: [number, number] } = {};

    const loadKiosks = async () => {
      try {
        const fetchedKiosks: Kiosk[] = await fetchAllKiosk();
        if (fetchedKiosks) {
          // Only include kiosks with status true
          const activeKiosks = fetchedKiosks.filter(kiosk => kiosk.status === true);
          setKiosks(activeKiosks);
    
          const geocodePromises = activeKiosks.map(async (kiosk) => {
            if (geocodeCache[kiosk.address]) {
              return { ...kiosk, coordinates: geocodeCache[kiosk.address] };
            }
    
            try {
              const geocodeResponse = await fetch(
                `https://api.maptiler.com/geocoding/${encodeURIComponent(kiosk.address)}.json?key=${key}`
              );
    
              if (!geocodeResponse.ok) throw new Error(`Failed to fetch geocode for ${kiosk.address}`);
              const geocodeData = await geocodeResponse.json();
    
              if (geocodeData.features && geocodeData.features.length > 0) {
                const { coordinates } = geocodeData.features[0].geometry;
                geocodeCache[kiosk.address] = coordinates;
                return { ...kiosk, coordinates };
              } else {
                console.error(`Geocoding failed for address: ${kiosk.address}`);
              }
            } catch (error) {
              console.error(error);
            }
            return null;
          });
    
          const results = await Promise.all(geocodePromises);
    
          results.forEach((result) => {
            if (result) {
              const marker = L.marker([result.coordinates[1], result.coordinates[0]], { icon: kioskIcon }).addTo(map);
              marker.bindPopup(
                `<b>${result.name}</b><br>${result.address}<br>${result.phoneNumber}<br>${result.openingHours}`
              );
            }
          });
        }
      } catch (error) {
        console.error("Error fetching kiosks:", error);
      } finally {
        setLoading(false);
      }
    };
    

    loadKiosks();

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div>
      {loading && <p>Loading kiosks...</p>}
      <div id="map" style={{ height: '100vh', width: '100%' }}></div>
      <a href="https://www.maptiler.com" style={{ position: 'absolute', left: '10px', bottom: '10px', zIndex: 999 }}>
        <img src="https://api.maptiler.com/resources/logo.svg" alt="MapTiler logo" />
      </a>
      <p>
        <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener noreferrer">&copy; MapTiler</a>
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">&copy; OpenStreetMap contributors</a>
      </p>
    </div>
  );
};

export default Map;
