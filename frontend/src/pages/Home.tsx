import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 
import { useNavigate } from 'react-router-dom';

const personas = [
    { label: 'Family Route', img: '/img/cltfan2.jpg', desc: 'Parks & Museums' },
    { label: 'The Soloist', img: '/img/uptown1.jpg', desc: 'Work & Exploration' }, 
    { label: 'Squad Trip', img: '/img/cltfans.jpg', desc: 'Friends & Vacation' },
    { label: 'Date Night', img: '/img/optimist1.jpg', desc: 'Couples & Vibes' },
];

const vibes = [
    { id: 'sports', label: 'The Competitor', img: '/img/nascar.jpg', tags: 'Racing, Panthers, Energy' },
    { id: 'food', label: 'The Foodie', img: '/img/beergarden.jpg', tags: 'Breweries, Local Eats, Patios' },
    { id: 'music', label: 'The Socialite', img: '/img/cltconcert.avif', tags: 'Live Music, Rooftops, Nightlife' },
];

const Home: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [selections, setSelections] = useState({
        persona: '',
        hours: 24, 
        vibes: [] as string[],
        budget: 500,
        radius: 10
    });

    const formatTime = (h: number) => {
        if (h === 168) return "1 Week";
        if (h >= 24) {
            const days = Math.floor(h / 24);
            const remainingHours = h % 24;
            if (remainingHours === 0) return `${days} ${days === 1 ? 'Day' : 'Days'}`;
            return `${days}d ${remainingHours}h`;
        }
        return `${h} Hrs`;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency', currency: 'USD', maximumFractionDigits: 0,
        }).format(amount);
    };

    const updateSelection = (field: string, value: any) => {
        setSelections(prev => ({ ...prev, [field]: value }));
    };

    const toggleVibe = (id: string) => {
        setSelections(prev => ({
            ...prev,
            vibes: prev.vibes.includes(id) ? prev.vibes.filter(v => v !== id) : [...prev.vibes, id]
        }));
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#080808] text-white font-inter">
            {/* DYNAMIC BACKGROUND */}
            <div className="fixed inset-0 -z-10">
                <img 
                    src={step === 5 ? "/img/cltconcert.avif" : "/img/cltskyline1.jpg"} 
                    className={`w-full h-full object-cover transition-all duration-[1200ms] ${step > 0 ? 'scale-105 brightness-[0.2] blur-sm' : 'brightness-50'}`} 
                    alt="Charlotte Backdrop" 
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#080808]/80 to-[#080808]" />
            </div>

            <div className="flex flex-col items-center justify-center min-h-screen px-6 py-20">
                <AnimatePresence mode="wait">
                    
                    {/* STEP 0: HERO */}
                    {step === 0 && (
                        <motion.div 
                            key="hero" 
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            exit={{ opacity: 0, scale: 1.05 }} 
                            className="text-center"
                        >
                            <h1 className="text-[14vw] md:text-[9rem] font-black leading-none mb-6 select-none font-inter tracking-tighter">
                                <span className="text-[#00703C]">CLT</span>
                                <span className="text-transparent" style={{ WebkitTextStroke: '1.5px #B3A369' }}>ourism</span>
                            </h1>
                            <div className="space-y-3 mb-12">
                                <h2 className="text-4xl md:text-6xl font-serif italic text-[#00703C] serif-glow">Plan smarter.</h2>
                                <h2 className="text-4xl md:text-6xl font-serif italic text-[#B3A369] serif-glow">Explore better.</h2>
                            </div>
                            
                            <div className="flex flex-col items-center gap-8">
                                <button 
                                    onClick={() => navigate('/login')} 
                                    className="px-16 py-6 rounded-full border-2 border-[#B3A369]/30 text-[#B3A369] tracking-[0.4em] uppercase text-sm font-bold hover:bg-[#B3A369] hover:text-black hover:scale-105 transition-all duration-500 shadow-xl font-inter"
                                >
                                    Get Started
                                </button>

                                <button 
                                    onClick={() => setStep(1)} 
                                    className="group flex flex-col items-center gap-2 transition-all"
                                >
                                    <span className="text-lg md:text-xl uppercase tracking-[0.3em] text-white/40 group-hover:text-white transition-colors duration-300 font-medium italic font-serif">
                                        Or try the planner first
                                    </span>
                                    <div className="h-[1px] w-12 bg-[#B3A369]/30 group-hover:w-full group-hover:bg-[#B3A369] transition-all duration-500"></div>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 1: PERSONA */}
                    {step === 1 && (
                        <motion.div key="persona" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-7xl">
                            <h3 className="text-5xl text-center font-serif mb-16 italic">Who are we planning for?</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
                                {personas.map((p) => (
                                    <div key={p.label} onClick={() => { updateSelection('persona', p.label); setStep(2); }} className="relative h-[480px] rounded-[2.5rem] overflow-hidden cursor-pointer group border border-white/5 hover:border-[#B3A369] transition-all duration-500 shadow-2xl">
                                        <img src={p.img} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-110 transition-all duration-1000" alt={p.label} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                                        <div className="absolute bottom-10 left-8 right-8">
                                            <p className="text-[#B3A369] text-[10px] tracking-[0.4em] uppercase mb-2 font-black font-inter">{p.desc}</p>
                                            <h4 className="text-3xl md:text-4xl font-serif leading-tight break-words">{p.label}</h4>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: TIME SLIDER */}
                    {step === 2 && (
                        <motion.div key="time" className="w-full max-w-2xl text-center">
                            <h3 className="text-5xl font-serif mb-4 italic">How long is the stay?</h3>
                            <h4 className="text-8xl font-serif mb-4 text-[#B3A369] tracking-tighter serif-glow">
                                {formatTime(Number(selections.hours))}
                            </h4>
                            <input type="range" min="1" max="168" value={selections.hours} onChange={(e) => updateSelection('hours', e.target.value)} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-uncc-green mb-8" />
                            <div className="flex justify-between text-[11px] text-[#B3A369] uppercase tracking-widest px-2 font-black opacity-60">
                                <span>1 Hour</span><span>1 Week</span>
                            </div>
                            <button onClick={() => setStep(3)} className="mt-16 px-14 py-4 rounded-full bg-uncc-green text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl">Confirm Time</button>
                        </motion.div>
                    )}

                    {/* STEP 3: VIBE CHECK */}
                    {step === 3 && (
                        <motion.div key="mission" className="w-full max-w-6xl text-center">
                            <h3 className="text-5xl font-serif mb-16 italic">What's the mission?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16 px-4">
                                {vibes.map((v) => (
                                    <div key={v.id} onClick={() => toggleVibe(v.id)} className={`relative h-[500px] rounded-[4rem] overflow-hidden cursor-pointer group border-2 transition-all duration-700 shadow-2xl ${selections.vibes.includes(v.id) ? 'border-[#B3A369] scale-95 shadow-[#B3A369]/20' : 'border-white/5 opacity-80'}`}>
                                        <img src={v.img} className="absolute inset-0 w-full h-full object-cover brightness-[0.7] group-hover:scale-110 transition-all duration-1000" alt={v.label} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                                        <div className="absolute bottom-12 left-0 right-0 px-8 text-center">
                                            <h4 className="text-4xl font-serif mb-3 leading-tight">{v.label}</h4>
                                            <p className="text-uncc-gold font-inter text-[11px] tracking-[0.4em] uppercase font-black">{v.tags}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {selections.vibes.length > 0 && <button onClick={() => setStep(4)} className="px-14 py-4 rounded-full bg-uncc-green text-white font-black uppercase text-xs tracking-widest shadow-xl">Next Step</button>}
                        </motion.div>
                    )}

                    {/* STEP 4: PARAMETERS */}
                    {step === 4 && (
                        <motion.div key="logistics" className="w-full max-w-2xl text-center px-6 glass py-16 rounded-[4rem]">
                            <h3 className="text-6xl font-serif mb-20 italic text-uncc-gold">Fine Tuning</h3>
                            <div className="space-y-24">
                                <div>
                                    <div className="flex justify-between items-end mb-6 px-2">
                                        <span className="text-xs text-uncc-green uppercase tracking-[0.4em] font-black">Radius</span>
                                        <span className="text-5xl font-serif">{selections.radius} Mi</span>
                                    </div>
                                    <input type="range" min="1" max="50" value={selections.radius} onChange={(e) => updateSelection('radius', e.target.value)} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-uncc-green" />
                                </div>
                                <div>
                                    <div className="flex justify-between items-end mb-6 px-2">
                                        <span className="text-xs text-uncc-green uppercase tracking-[0.4em] font-black">Budget</span>
                                        <span className="text-5xl font-serif">{formatCurrency(Number(selections.budget))}</span>
                                    </div>
                                    <input 
                                        type="range" min="10" max="5000" step="10" 
                                        value={selections.budget} 
                                        onChange={(e) => updateSelection('budget', e.target.value)} 
                                        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-uncc-green" 
                                    />
                                    {Number(selections.budget) >= 3000 && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-uncc-gold text-[10px] font-black tracking-[0.3em] uppercase mt-6">
                                            ✨ Platinum Experience Tier ✨
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setStep(5)} className="mt-24 px-16 py-5 rounded-full bg-white text-black font-black uppercase text-xs tracking-[0.4em] hover:bg-uncc-green hover:text-white transition-colors">Generate Experience</button>
                        </motion.div>
                    )}

                    {/* STEP 5: FINAL BRIDGE */}
                    {step === 5 && (
                        <motion.div key="final" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-3xl glass p-20 rounded-[5rem] shadow-2xl">
                            <h3 className="text-8xl font-serif mb-8 text-uncc-gold italic leading-tight">Ready to Roll.</h3>
                            <p className="text-white/80 mb-14 font-inter leading-relaxed text-xl px-10">
                                Your custom Queen City pulse is synchronized! We've mapped out the perfect {formatTime(Number(selections.hours))} journey for your {selections.persona}.
                            </p>
                            <button 
                                onClick={() => navigate('/itinerary', { state: { selections } })} 
                                className="px-14 py-6 rounded-full bg-uncc-green text-white font-black uppercase text-sm tracking-[0.4em] hover:scale-105 transition-all shadow-lg shadow-uncc-green/20"
                            >
                                Unlock Your Dashboard
                            </button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
};

export default Home;