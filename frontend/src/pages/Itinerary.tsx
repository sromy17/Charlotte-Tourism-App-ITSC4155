import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Plus, Minus, MapPin, Clock, Loader2, 
  Utensils, TreePine, Palette, Music, 
  Ticket, Beer, Zap, Wallet 
} from 'lucide-react';

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
  const [weather, setWeather] = useState<any>(null);

  // Helper to get icons based on activity name
  const getIcon = (activity: string) => {
    const text = activity.toLowerCase();
    if (text.includes('food') || text.includes('hall') || text.includes('sushi')) return <Utensils size={18} />;
    if (text.includes('park') || text.includes('nature') || text.includes('whitewater')) return <TreePine size={18} />;
    if (text.includes('museum') || text.includes('art')) return <Palette size={18} />;
    if (text.includes('music') || text.includes('jazz')) return <Music size={18} />;
    if (text.includes('brewery') || text.includes('bar')) return <Beer size={18} />;
    return <Ticket size={18} />;
  };

  // Calculate Budget Spent
  const budgetSpent = useMemo(() => {
    return myPlan.reduce((acc, curr) => {
        const costStr = curr.cost || "$$";
        return acc + (costStr.length * 25); // Simple math: $ = 25, $$ = 50, etc.
    }, 0);
  }, [myPlan]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const attRes = await fetch('http://127.0.0.1:8000/api/attractions/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selections),
        });
        const attData = await attRes.json();
        setSuggestions(attData);

        const weathRes = await fetch('http://127.0.0.1:8000/api/weather/forecast');
        const weathData = await weathRes.json();
        setWeather(weathData);
      } catch (err) {
        console.error("Link failure:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addToPlan = (spot: any) => {
    setMyPlan(prev => [...prev, spot]); 
    setSuggestions(prev => prev.filter(item => item.id !== spot.id));
  };

  const removeFromPlan = (spot: any) => {
    setSuggestions(prev => [spot, ...prev]);
    setMyPlan(prev => prev.filter(item => item.id !== spot.id));
  };

  return (
    <div className="min-h-screen bg-[#030303] pt-24 pb-20 px-6 text-[#F9F8F3] font-inter selection:bg-[#B3A369] selection:text-black">
      <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        
        {/* SIDEBAR: TRIP HUD */}
        <div className="lg:col-span-4">
            <div className="sticky top-28 glass p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/10 to-transparent shadow-2xl">
                <h1 className="text-6xl mb-2 font-serif italic text-[#B3A369] serif-glow leading-tight">Safari</h1>
                <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black mb-8">Personalized Itinerary</p>
                
                <div className="space-y-6 mb-10">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[9px] uppercase text-white/30 font-bold mb-1">Current Vibe</p>
                            <span className="text-xl font-serif italic text-[#B3A369]">{selections.persona}</span>
                        </div>
                        <Zap size={16} className="text-[#B3A369] opacity-50 mb-1" />
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <p className="text-[9px] uppercase text-white/30 font-bold">Budget Usage</p>
                            <span className="text-xs font-black text-emerald-500">${budgetSpent} / ${selections.budget}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-emerald-500 transition-all duration-700 ease-out" 
                                style={{ width: `${Math.min((budgetSpent / selections.budget) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {weather && (
                  <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="text-5xl font-serif italic text-[#B3A369] leading-none">{weather.current_temp}°</div>
                        <div className="text-[10px] uppercase font-black text-white/40">{weather.description}</div>
                    </div>
                    <img src={`http://openweathermap.org/img/wn/${weather.hourly?.[0]?.icon}.png`} className="w-10 h-10 opacity-60" />
                  </div>
                )}
            </div>
        </div>

        {/* MAIN FEED: THE PLANNER */}
        <div className="lg:col-span-8 space-y-12">
            
            {/* 1. MY PLAN (Active View) */}
            <section className="relative">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xs font-black uppercase tracking-[0.5em] text-emerald-500 flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> My Schedule
                  </h2>
                </div>

                {myPlan.length === 0 ? (
                    <div className="group glass p-20 rounded-[3rem] border border-white/5 text-center bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-default">
                        <div className="inline-flex p-4 rounded-full bg-white/5 text-white/10 mb-6 group-hover:scale-110 transition-transform">
                            <Clock size={32} />
                        </div>
                        <p className="text-white/20 font-serif text-xl italic">Empty schedule. Pick your first adventure.</p>
                    </div>
                ) : (
                    <div className="space-y-4 relative">
                        {/* THE PATH LINE (Visual flow) */}
                        <div className="absolute left-8 top-10 bottom-10 w-px bg-gradient-to-b from-emerald-500/50 via-white/5 to-transparent hidden md:block" />
                        
                        {myPlan.map((spot, idx) => (
                            <div key={spot.id} className="glass ml-0 md:ml-12 p-6 rounded-[2rem] border border-white/10 flex justify-between items-center group relative hover:border-emerald-500/40 transition-all shadow-xl">
                                <div className="absolute -left-[3.25rem] w-4 h-4 rounded-full bg-[#030303] border-2 border-emerald-500 hidden md:block" />
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-emerald-500/5 text-emerald-500 rounded-2xl">
                                        {getIcon(spot.activity)}
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-emerald-500 font-black tracking-widest uppercase mb-1">{spot.time || 'Next Up'}</div>
                                        <h3 className="text-2xl font-serif italic text-white">{spot.activity}</h3>
                                        <p className="text-xs text-white/30 font-medium tracking-wide flex items-center gap-1">
                                            <MapPin size={12} /> {spot.location}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => removeFromPlan(spot)} className="p-4 rounded-2xl bg-white/5 text-white/20 hover:bg-red-500/10 hover:text-red-500 transition-all">
                                  <Minus size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* 2. SUGGESTIONS GRID */}
            <section>
                <div className="mb-10 flex justify-between items-end">
                    <div>
                        <h2 className="text-xs font-black uppercase tracking-[0.5em] text-[#B3A369] mb-2">Live Discoveries</h2>
                        <p className="text-white/40 italic font-serif text-xl leading-none">The pulse of the Queen City</p>
                    </div>
                    {loading && <Loader2 className="animate-spin text-[#B3A369]" />}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {suggestions.map((spot) => (
                        <div key={spot.id} className="group relative glass p-8 rounded-[2.5rem] border border-white/5 hover:border-[#B3A369]/40 hover:bg-white/[0.04] transition-all flex flex-col justify-between overflow-hidden">
                            {/* Decorative background glow */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#B3A369]/5 rounded-full blur-3xl group-hover:bg-[#B3A369]/10 transition-colors" />
                            
                            <div>
                                <div className="flex justify-between items-start mb-8">
                                    <div className="p-3 bg-white/5 rounded-xl text-[#B3A369] group-hover:scale-110 transition-transform">
                                        {getIcon(spot.activity)}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black tracking-[0.2em] text-[#B3A369] uppercase mb-1">{spot.drive_time}</span>
                                        <span className="text-xs font-black text-emerald-500/80 tracking-tighter">{spot.cost}</span>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-serif italic mb-3 text-white leading-snug group-hover:text-[#B3A369] transition-colors">{spot.activity}</h3>
                                <p className="text-white/40 text-sm mb-10 leading-relaxed font-light line-clamp-3">"{spot.description}"</p>
                            </div>
                            
                            <button 
                              onClick={() => addToPlan(spot)} 
                              className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#B3A369] hover:text-black hover:border-[#B3A369] transition-all active:scale-95 shadow-lg"
                            >
                                <Plus size={14} className="inline mr-2" /> Add Destination
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
      </div>
    </div>
  );
};

export default Itinerary;