import React, { useEffect, useRef, useState } from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import axios from 'axios';

type Location = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
};

const MapView: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const [locations, setLocations] = useState<Location[]>([]);

  // Load locations from backend
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/locations');
        setLocations(res.data);
      } catch (err) {
        console.log('Failed to load locations', err);
      }
    };

    fetchLocations();
  }, []);

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    console.log("MAP INIT START");

    mapInstance.current = tt.map({
      key: process.env.REACT_APP_TOMTOM_KEY || '',
      container: mapRef.current,
      center: [-80.8431, 35.2271],
      zoom: 12
    });

    console.log("MAP CREATED");

    setTimeout(() => {
      mapInstance.current?.resize();
    }, 300);

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  // Add markers
  useEffect(() => {
    if (!mapInstance.current || locations.length === 0) return;

    locations.forEach((loc) => {
      const marker = new tt.Marker()
        .setLngLat([loc.longitude, loc.latitude])
        .addTo(mapInstance.current);

      const popup = new tt.Popup({
        offset: 25,
        className: 'custom-popup'
      }).setHTML(`
        <div class="popup-content">
          ${loc.name}
        </div>
      `);

      marker.setPopup(popup);
    });
  }, [locations]);

  return (
    <div className="min-h-screen w-full bg-[#020202] px-6 pb-16">
      <div className="mx-auto max-w-6xl">
        <div className="luxury-panel p-6">

          <h1 className="text-2xl text-[#d6c08e] mb-4">
            Charlotte Map
          </h1>

          <div
            ref={mapRef}
            style={{
              width: '100%',
              height: '600px',
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MapView;