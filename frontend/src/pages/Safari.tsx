import React, { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Search, MapPin, Clock, Ticket, Navigation, Info, Wind, Droplets } from 'lucide-react';

const Safari = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [query, setQuery] = useState('');
    const [itinerary, setItinerary] = useState([]);
    const [weather, setWeather] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // 1. Fetch Weather Forecast on Load
    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/weather/forecast')
            .then(res => {
                if (!res.ok) throw new Error("Weather not found");
                return res.json();
            })
            .then(data => setWeather(data))
            .catch(err => console.error("Weather Fetch Error:", err));
    }, []);

    // 2. Generate Itinerary Logic
    const handleGenerate = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/attractions/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    date: startDate.toISOString().split('T')[0], 
                    query: query 
                }),
            });
            const data = await response.json();
            setItinerary(data);
        } catch (err) { 
            console.error("Discovery Error:", err); 
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-[#F9F8F3] p-4 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                
                {/* --- HEADER SECTION --- */}
                <header className="mb-12 text-center">
                    <h1 className="text-7xl md:text-8xl font-normal serif-glow mb-4 text-gradient-gold">
                        Charlotte Safari
                    </h1>
                    <p className="text-gray-500 uppercase tracking-[0.3em] text-xs font-bold">
                        Real-time City Discovery Engine
                    </p>
                </header>

                {/* --- 3. LIVE WEATHER DASHBOARD (The "Super Good" Part) --- */}
                {weather && (
                    <div className="glass rounded-[2.5rem] p-8 mb-10 relative overflow-hidden">
                        <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
                            <div className="flex items-center gap-8">
                                <div className="text-center md:text-left">
                                    <h2 className="text-8xl font-normal leading-none mb-2">{weather.current_temp}°</h2>
                                    <p className="text-xl text-gray-400 font-light italic uppercase tracking-widest">{weather.description}</p>
                                </div>
                            </div>

                            {/* HOURLY SCROLLBAR */}
                            <div className="flex gap-6 overflow-x-auto no-scrollbar pb-2 w-full lg:max-w-xl">
                                {weather.hourly?.map((h: any, i: number) => (
                                    <div key={i} className="text-center min-w-[85px] transition-transform hover:scale-110">
                                        <p className="text-[10px] text-gray-500 font-bold mb-2 uppercase">{h.time}</p>
                                        <p className="text-2xl font-normal italic">{h.temp}°</p>
                                        <img src={`http://openweathermap.org/img/wn/${h.icon}.png`} className="w-10 h-10 mx-auto opacity-70" alt="weather" />
                                        {h.is_risky && <div className="w-1 h-1 bg-red-500 rounded-full mx-auto mt-1 animate-ping" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- 4. SEARCH & DISCOVERY CONTROLS --- */}
                <div className="glass p-3 rounded-3xl flex flex-col lg:flex-row gap-4 mb-16">
                    <div className="flex-1 flex items-center px-6 gap-4 bg-white/[0.03] rounded-2xl border border-white/5 focus-within:border-[#B3A369]/40 transition-all">
                        <Search size={22} className="text-gray-600" />
                        <input 
                            placeholder="What are you looking for? (e.g. Sushi, Jazz, Parks)" 
                            className="bg-transparent w-full py-5 outline-none text-[#F9F8F3] placeholder:text-gray-700 text-lg font-light"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <div className="bg-white/[0.03] px-6 rounded-2xl border border-white/5 flex items-center">
                        <DatePicker 
                            selected={startDate} 
                            onChange={(date: Date | null) => setStartDate(date as Date)} 
                            className="bg-transparent py-5 cursor-pointer outline-none font-bold text-[#B3A369] w-32" 
                        />
                    </div>
                    <button 
                        onClick={handleGenerate} 
                        className="bg-[#B3A369] hover:bg-[#C4B47A] text-black font-bold px-12 py-5 rounded-2xl transition-all active:scale-95 shadow-lg"
                    >
                        {loading ? "SEARCHING..." : "DISCOVER"}
                    </button>
                </div>

                {/* --- 5. DISCOVERY GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {itinerary.map((item: any) => (
                        <div key={item.id} className="glass card-hover rounded-[2rem] p-8 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-4 bg-white/[0.05] rounded-2xl text-[#B3A369]">
                                        {item.id.includes('tm') ? <Ticket size={24}/> : <MapPin size={24}/>}
                                    </div>
                                    <span className="text-[10px] font-bold bg-white/5 px-3 py-1.5 rounded-full text-gray-500 flex items-center gap-2">
                                        <Clock size={12}/> {item.drive_time}
                                    </span>
                                </div>
                                <h3 className="text-2xl mb-2 group-hover:text-[#B3A369] transition-colors">{item.activity}</h3>
                                <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-4">{item.location}</p>
                                <p className="text-gray-400 text-sm leading-relaxed italic font-light">"{item.description}"</p>
                            </div>
                            
                            <div className="flex justify-between items-center pt-8 mt-4 border-t border-white/5">
                                <span className="text-[#B3A369] font-bold text-lg">{item.cost}</span>
                                <button className="p-3 bg-white/5 rounded-xl hover:bg-[#B3A369] hover:text-black transition-all">
                                    <Info size={18}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* EMPTY STATE */}
                {!loading && itinerary.length === 0 && (
                    <div className="text-center py-24 opacity-10">
                        <h2 className="text-6xl italic">Search for something...</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Safari;