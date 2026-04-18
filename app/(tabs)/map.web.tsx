import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { db } from '../../firebaseConfig';

export default function MapScreen() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [spaces, setSpaces] = useState<any[]>([]);

  // 1. Fetch spaces from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'spaces'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSpaces(data);
    });
    return unsub;
  }, []);

  // 2. Init map dynamically (avoids window/document errors)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Fix missing marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      mapRef.current = L.map(mapContainerRef.current!).setView([42.2808, -83.7430], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
    };

    initMap();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // 3. Add/update markers whenever spaces change
  useEffect(() => {
    if (!mapRef.current) return;

    const addMarkers = async () => {
      const L = (await import('leaflet')).default;

      spaces.forEach((space) => {
        if (space.latitude && space.longitude) {  // 👈 change to your field names
          L.marker([space.latitude, space.longitude])
            .addTo(mapRef.current)
            .bindPopup(`<strong>${space.name}</strong><br/>${space.address || ''}`);
        }
      });
    };

    addMarkers();
  }, [spaces]);

  return (
    <div ref={mapContainerRef} style={{ height: '100vh', width: '100%' }} />
  );
}