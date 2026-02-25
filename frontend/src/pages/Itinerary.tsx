import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Minus, MapPin, Clock, Loader2 } from 'lucide-react';

const Itinerary: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const selections = location.state?.selections || {
    persona: 'The Soloist',
    budget: 500,
    hours: 24,
  };

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [myPlan, setMyPlan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItinerary = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://127.0.0.1:8000/api/attractions/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selections),
        });
        
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        
        const data = await response.json();
        
        // DEBUGGER: This will print the actual array in your browser console
        console.log("CHEF'S DELIVERY (Data from Backend):", data); 
        
        setSuggestions(data);
      } catch (err) {
        console.error("Error connecting to backend:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, []); // Only run once on mount

  const addToPlan = (spot: any) => {
    setMyPlan(prev => [...prev, spot]); 
    setSuggestions(prev => prev.filter(item => item.id !== spot.id));
  };

  const removeFromPlan = (spot: any) => {
    setSuggestions(prev => [...prev, spot]);
    setMyPlan(prev => prev.filter(item => item.id !== spot.id));
  };

  const handleSaveToProfile = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#080808] pt-32 pb-20 px-6 font-inter text-white">
      <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* LEFT COLUMN: Summary */}
        <div className="lg:col-span-4">
            <div className="sticky top-32 glass p-8 rounded-[2rem] border border-white/5 shadow-2xl bg-white/5 backdrop-blur-md">
                <h1 className="text-5xl mb-6 font-serif italic text-[#B3A369] serif-glow">Your Safari</h1>
                <div className="space-y-5 mt-8">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                        <span className="text-[10px] uppercase tracking-widest text-white/50 font-black">Persona</span>
                        <span className="text-sm font-bold text-white">{selections.persona}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                        <span className="text-[10px] uppercase tracking-widest text-white/50 font-black">Budget</span>
                        <span className="text-sm font-bold text-[#00703C]">${selections.budget}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                        <span className="text-[10px] uppercase tracking-widest text-white/50 font-black">Duration</span>
                        <span className="text-sm font-bold text-white">{selections.hours} Hours</span>
                    </div>
                </div>
                <button onClick={handleSaveToProfile} className="w-full mt-10 py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#00703C] hover:border-[#00703C] transition-all">
                    Save to Profile
                </button>
            </div>
        </div>

        {/* RIGHT COLUMN: Builder */}
        <div className="lg:col-span-8 flex flex-col gap-12">
            <div>
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#00703C] mb-2">My Locked-In Plan</h2>
                {myPlan.length === 0 ? (
                    <div className="border border-dashed border-white/10 rounded-2xl p-10 text-center bg-white/[0.02]">
                        <Clock className="w-8 h-8 text-white/20 mx-auto mb-4" />
                        <p className="text-white/40 font-inter text-sm text-balance">Select live events or locations from the suggestions below.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {myPlan.map((spot) => (
                            <div key={spot.id} className="glass p-5 rounded-2xl border border-[#00703C]/30 flex justify-between items-center group">
                                <div>
                                    <div className="text-xs text-[#00703C] font-black tracking-widest mb-1">{spot.time}</div>
                                    <h3 className="text-xl font-serif text-white">{spot.activity}</h3>
                                    <p className="text-xs text-white/40 uppercase tracking-wider"><MapPin className="inline w-3 h-3 mr-1" />{spot.location}</p>
                                </div>
                                <button onClick={() => removeFromPlan(spot)} className="p-2 text-white/20 hover:text-red-400"><Minus size={20} /></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <hr className="border-white/5" />

            <div>
                <div className="mb-6 flex justify-between items-end">
                    <div>
                        <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#B3A369] mb-2">Live Suggestions</h2>
                        <p className="text-white/50 italic font-serif text-lg">Real-time pulse from Ticketmaster & TomTom.</p>
                    </div>
                    {loading && <Loader2 className="animate-spin text-[#B3A369] mb-2" />}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse border border-white/5" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {suggestions.map((spot) => (
                            <div key={spot.id} className="glass p-5 rounded-2xl border border-white/5 hover:bg-white/5 transition-all flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] text-[#B3A369] font-black tracking-widest uppercase bg-[#B3A369]/10 px-2 py-1 rounded-full">{spot.time}</span>
                                        <span className="text-sm text-[#00703C] font-black">{spot.cost}</span>
                                    </div>
                                    <h3 className="text-lg font-serif text-white mb-1 line-clamp-1">{spot.activity}</h3>
                                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-3 line-clamp-1"><MapPin className="inline w-3 h-3 mr-1" />{spot.location}</p>
                                    <p className="text-white/60 text-sm mb-6 line-clamp-2">{spot.description}</p>
                                </div>
                                <button onClick={() => addToPlan(spot)} className="w-full py-3 rounded-lg bg-[#00703C]/20 text-[#00703C] hover:bg-[#00703C] hover:text-white flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all">
                                    <Plus size={16} /> Add to Plan
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Itinerary;