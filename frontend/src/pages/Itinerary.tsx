import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useExperienceStore } from '../state/experienceStore';
import { useAuthStore } from '../state/authStore';
import { updateItinerary } from '../services/api';
import RecommendationCard from '../components/RecommendationCard';
import api from '../services/api';

const Itinerary: React.FC = () => {
  const { recommendations } = useExperienceStore();
  const user = useAuthStore((state) => state.user);
  
  const [dbPlan, setDbPlan] = useState<any[]>([]);
  const [itineraryId, setItineraryId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddDrawer, setShowAddDrawer] = useState(false);

  const signedInUser = user || JSON.parse(localStorage.getItem('user') || '{}');

  const convertTimeToMinutes = (timeString: string | undefined): number => {
    if (!timeString) return 9999; 
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  useEffect(() => {
    const fetchLatest = async () => {
      if (!signedInUser?.id) return;
      try {
        const res = await api.get(`/api/itineraries/latest/${signedInUser.id}`);
        if (res.data?.id) {
      setItineraryId(res.data.id);
      setDbPlan(res.data.saved_activities?.items || []);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchLatest();
  }, [signedInUser?.id]);

  const handleUpdateTime = (idx: number, newTime: string) => {
    const updated = [...dbPlan];
    updated[idx] = { ...updated[idx], time: newTime };
    const sorted = updated.sort((a, b) => convertTimeToMinutes(a.time) - convertTimeToMinutes(b.time));
    setDbPlan(sorted);
  };

  const handleRemoveSpot = (idx: number) => {
    setDbPlan(dbPlan.filter((_, i) => i !== idx));
  };

  const saveChanges = async () => {
    if (!itineraryId || !signedInUser?.id) return;
    setIsSaving(true);
    try {
      await updateItinerary(itineraryId, {
        trip_name: "Charlotte Journey",
        user_id: Number(signedInUser.id),
        saved_activities: {
          items: dbPlan,
          saved_at: new Date().toISOString()
        }
      });
      setIsEditing(false);
    } catch (err) {
      alert("Failed to sync changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const discoveryItems = useMemo(() => {
    return [
      ...(recommendations?.activities || []),
      ...(recommendations?.restaurants || []),
      ...(recommendations?.events || [])
    ];
  }, [recommendations]);

  return (
    <div className="min-h-screen bg-[#020202] text-white flex justify-center">
      <div className="w-full max-w-2xl border-x border-white/10 bg-[#081311]/20 backdrop-blur-xl flex flex-col min-h-screen">
        <header className="p-8 border-b border-white/10 flex justify-between items-end">
          <div>
            <p className="text-[#79bfa0] text-[10px] uppercase tracking-[0.3em] mb-1">Charlotte Journey</p>
            <h1 className="text-3xl italic font-serif">The Schedule</h1>
          </div>
          <button 
            onClick={() => isEditing ? saveChanges() : setIsEditing(true)}
            className="px-6 py-2 rounded-full border border-[#d6c08e]/30 text-[10px] font-mono uppercase tracking-widest text-[#d6c08e] hover:bg-[#d6c08e] hover:text-black transition-all"
          >
            {isSaving ? 'Syncing...' : isEditing ? 'Save Layout' : 'Edit Day'}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 luxury-scroll">
          {dbPlan.length === 0 ? (
            <div className="py-20 text-center text-white/20 italic">Timeline empty.</div>
          ) : (
            dbPlan.map((item, idx) => (
              <motion.div layout key={item.id || idx} className="relative flex gap-8 group">
                {idx !== dbPlan.length - 1 && (
                  <div className="absolute left-[19px] top-10 h-full w-[1px] bg-gradient-to-b from-[#79bfa0]/40 to-transparent" />
                )}
                <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#79bfa0]/30 bg-[#020202] text-[10px] font-bold text-[#79bfa0]">
                  {item.time || '—'}
                </div>
                <div className="flex-1 min-w-0 pb-6 border-b border-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-serif italic truncate">{item.name}</h3>
                    {isEditing && (
                      <button onClick={() => handleRemoveSpot(idx)} className="text-red-400/40 hover:text-red-400 text-[9px] font-mono uppercase">Remove</button>
                    )}
                  </div>
                  <p className="text-white/40 text-xs mb-4">{item.address || item.location}</p>
                  {isEditing && (
                    <input 
                      type="time" 
                      value={item.time || ""}
                      onChange={(e) => handleUpdateTime(idx, e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-[#79bfa0] outline-none"
                    />
                  )}
                </div>
              </motion.div>
            ))
          )}
          <button 
            onClick={() => setShowAddDrawer(true)}
            className="w-full mt-10 rounded-2xl border border-dashed border-white/10 py-8 text-[10px] font-mono uppercase tracking-[0.3em] text-white/20 hover:text-[#79bfa0]"
          >
            + Add New Experience
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showAddDrawer && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed bottom-0 left-0 right-0 h-[70vh] bg-[#020202] border-t border-[#79bfa0]/30 z-50 p-10 shadow-2xl">
            <div className="max-w-5xl mx-auto h-full flex flex-col">
              <div className="flex justify-between items-center mb-10 text-xl luxury-label text-white">Nearby Recommendations <button onClick={() => setShowAddDrawer(false)}>✕</button></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-y-auto">
                {discoveryItems.map((item: any) => (
                  <RecommendationCard 
                    key={item.id} 
                    item={item} 
                    onAdd={() => {
                      const sorted = [...dbPlan, { ...item, time: '12:00' }].sort((a, b) => convertTimeToMinutes(a.time) - convertTimeToMinutes(b.time));
                      setDbPlan(sorted);
                      setShowAddDrawer(false);
                      setIsEditing(true);
                    }}
                    isAdded={dbPlan.some(p => p.id === item.id)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Itinerary;