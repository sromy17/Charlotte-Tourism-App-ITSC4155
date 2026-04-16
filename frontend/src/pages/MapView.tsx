import React, { useEffect, useMemo, useRef, useState } from 'react';
import tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import axios from 'axios';
import { useExperienceStore } from '../state/experienceStore';
import { useAuthStore } from '../state/authStore';

const MapView: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [dbPlaces, setDbPlaces] = useState<any[]>([]);

  const user = useAuthStore((state) => state.user);
  const selectedPlaces = useExperienceStore((state) => state.selectedPlaces);
  const apiKey = process.env.REACT_APP_TOMTOM_KEY?.trim();

  // 1. FETCH FROM DATABASE
  useEffect(() => {
    const fetchLatestItinerary = async () => {
      const signedInUser = user || JSON.parse(localStorage.getItem('user') || '{}');
      if (!signedInUser?.id) return;

      try {
        const res = await axios.get(`http://localhost:8000/api/itineraries/latest/${signedInUser.id}`);
        if (res.data?.saved_activities?.items) {
          setDbPlaces(res.data.saved_activities.items);
        }
      } catch (err) {
        console.error("Map Database Fetch Error:", err);
      }
    };
    fetchLatestItinerary();
  }, [user]);

  // 2. COMBINE DATA & CLEAN COORDINATES
  const finalLocations = useMemo(() => {
    const source = selectedPlaces.length > 0 ? selectedPlaces : dbPlaces;
    
    return source
      .map((item: any) => {
        const rawLat = item.latitude ?? item.coordinates?.latitude ?? item.lat;
        const rawLng = item.longitude ?? item.coordinates?.longitude ?? item.lng;

        const lat = (rawLat !== null && rawLat !== undefined) ? Number(rawLat) : null;
        const lng = (rawLng !== null && rawLng !== undefined) ? Number(rawLng) : null;

        return {
          id: item.id || Math.random().toString(),
          name: item.name || "Unknown Stop",
          lat: lat,
          lng: lng,
          description: item.location || item.address || "Charlotte, NC"
        };
      })
      // Filter out anything that would crash the map
      .filter((loc) => loc.lat !== null && loc.lng !== null && !isNaN(loc.lat) && !isNaN(loc.lng));
  }, [selectedPlaces, dbPlaces]);

  // 3. INITIALIZE MAP
  useEffect(() => {
    if (!apiKey || !mapRef.current || mapInstanceRef.current) return;

    try {
      const map = tt.map({
        key: apiKey,
        container: mapRef.current,
        center: [-80.8431, 35.2271],
        zoom: 12,
      });
      mapInstanceRef.current = map;
    } catch (e) {
      setMapError("Failed to load map.");
    }

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, [apiKey]);

  // 4. DRAW MARKERS
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || finalLocations.length === 0) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const bounds = new tt.LngLatBounds();

    finalLocations.forEach((loc) => {
      try {
        const marker = new tt.Marker()
          .setLngLat([loc.lng!, loc.lat!]) // Trusting the numbers here
          .addTo(map);
        
        const popup = new tt.Popup({ offset: 25 }).setHTML(`
          <div style="color: black; padding: 5px;">
            <strong>${loc.name}</strong>
          </div>
        `);

        marker.setPopup(popup);
        markersRef.current.push(marker);
        bounds.extend([loc.lng!, loc.lat!]);
      } catch (e) {
        console.error("Marker error:", e);
      }
    });

    map.fitBounds(bounds, { padding: 100, maxZoom: 15 });
  }, [finalLocations]);

  return (
    <div className="min-h-screen bg-[#020202] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <p className="text-[#79bfa0] text-xs uppercase tracking-widest">Charlotte Navigation</p>
          <h1 className="text-4xl italic font-serif">Itinerary Map</h1>
        </header>

        <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
          <aside className="bg-slate-950/80 border border-white/10 rounded-[32px] p-6 h-fit">
            <h2 className="text-[#d6c08e] text-xs uppercase tracking-widest mb-4">Your Stops</h2>
            <div className="space-y-3">
              {finalLocations.length === 0 ? (
                <p className="text-white/30 text-sm italic">Loading your itinerary...</p>
              ) : (
                finalLocations.map(loc => (
                  <div key={loc.id} className="p-3 bg-white/5 border border-white/5 rounded-2xl">
                    <p className="text-white font-medium text-sm">{loc.name}</p>
                    <p className="text-[10px] text-white/40">
                      {loc.lng!.toFixed(4)}, {loc.lat!.toFixed(4)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </aside>

          <div className="rounded-[32px] border border-white/10 overflow-hidden shadow-2xl">
            <div ref={mapRef} className="h-[70vh] w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;