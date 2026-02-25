import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 

// --- Assets & Data mapped to your /public/img folder ---
const personas = [
    { label: 'Family & Kids', img: '/img/cltfan2.jpg', desc: 'Parks & Museums' },
    { label: 'Solo/Professional', img: '/img/uptown1.jpg', desc: 'Work & Dining' },
    { label: 'Small Group', img: '/img/cltfans.jpg', desc: 'Friends & Vacation' },
    { label: 'Couples', img: '/img/optimist1.jpg', desc: 'Date Night & Vibes' },
];

const vibes = [
    { id: 'sports', label: 'The Competitor', img: '/img/nascar.jpg', tags: 'Racing, Panthers, Energy' },
    { id: 'food', label: 'The Foodie', img: '/img/beergarden.jpg', tags: 'Breweries, Local Eats, Patios' },
    { id: 'music', label: 'The Socialite', img: '/img/cltconcert.avif', tags: 'Live Music, Rooftops, Nightlife' },
];

const Home: React.FC = () => {
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
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
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
        <div className="relative min-h-screen w-full overflow-hidden bg-black text-white font-inter">
            {/* DYNAMIC BACKGROUND */}
            <div className="fixed inset-0 -z-10">
                <img 
                    src={step === 5 ? "/img/cltconcert.avif" : "/img/cltskyline1.jpg"} 
                    className={`w-full h-full object-cover transition-all duration-[1200ms] ${step > 0 ? 'scale-105 brightness-[0.2] blur-sm' : 'brightness-40'}`} 
                    alt="Charlotte Backdrop" 
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/80 to-black" />
            </div>

            <div className="flex flex-col items-center justify-center min-h-screen px-6 py-20">
                <AnimatePresence mode="wait">
                    
                    {/* STEP 0: HERO */}
                    {step === 0 && (
                        <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                            <h1 className="text-[14vw] md:text-[9rem] font-serif-headline leading-none mb-6 select-none font-bold">
                                <span className="text-[#00703C]">CLT</span>
                                <span className="text-transparent" style={{ WebkitTextStroke: '1.5px #B3A369' }}>ourism</span>
                            </h1>
                            <div className="space-y-3 mb-12">
                                <h2 className="text-4xl md:text-6xl font-serif-headline italic text-[#00703C]">Plan smarter.</h2>
                                <h2 className="text-4xl md:text-6xl font-serif-headline italic text-[#B3A369]">Explore better.</h2>
                            </div>
                            <button onClick={() => setStep(1)} className="px-14 py-5 rounded-full border-2 border-[#B3A369]/30 text-[#B3A369] tracking-[0.4em] uppercase text-xs font-bold hover:bg-[#B3A369] hover:text-black transition-all duration-500 shadow-lg">
                                Begin Your Journey
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 1: PERSONA */}
                    {step === 1 && (
                        <motion.div key="persona" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-7xl">
                            <h3 className="text-5xl text-center font-serif-headline mb-16 italic">Who are we planning for?</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
                                {personas.map((p) => (
                                    <div key={p.label} onClick={() => { updateSelection('persona', p.label); setStep(2); }} className="relative h-[480px] rounded-[2.5rem] overflow-hidden cursor-pointer group border border-white/5 hover:border-[#B3A369] transition-all duration-500 shadow-2xl">
                                        <img src={p.img} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-110 transition-all duration-1000" alt={p.label} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                                        <div className="absolute bottom-10 left-8">
                                            <p className="text-[#B3A369] text-[10px] tracking-[0.4em] uppercase mb-2 font-bold">{p.desc}</p>
                                            <h4 className="text-4xl font-serif-headline">{p.label}</h4>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: TIME SLIDER */}
                    {step === 2 && (
                        <motion.div key="time" className="w-full max-w-2xl text-center">
                            <h3 className="text-5xl font-serif-headline mb-4 italic font-light">How long is the stay?</h3>
                            <h4 className="text-8xl font-serif-headline mb-4 text-[#B3A369] tracking-tighter">
                                {formatTime(Number(selections.hours))}
                            </h4>
                            <input type="range" min="1" max="168" value={selections.hours} onChange={(e) => updateSelection('hours', e.target.value)} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#B3A369] mb-8" />
                            <div className="flex justify-between text-[11px] text-[#B3A369] uppercase tracking-widest px-2 font-bold opacity-60">
                                <span>1 Hour</span><span>1 Week</span>
                            </div>
                            <button onClick={() => setStep(3)} className="mt-16 px-14 py-4 rounded-full bg-[#B3A369] text-black font-black uppercase text-xs tracking-[0.2em] shadow-xl">Confirm Time</button>
                        </motion.div>
                    )}

                    {/* STEP 3: VIBE CHECK */}
                    {step === 3 && (
                        <motion.div key="mission" className="w-full max-w-6xl text-center">
                            <h3 className="text-5xl font-serif-headline mb-16 italic font-light">What's the mission?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16 px-4">
                                {vibes.map((v) => (
                                    <div key={v.id} onClick={() => toggleVibe(v.id)} className={`relative h-[500px] rounded-[4rem] overflow-hidden cursor-pointer group border-2 transition-all duration-700 shadow-2xl ${selections.vibes.includes(v.id) ? 'border-[#B3A369] scale-95' : 'border-white/5 opacity-80'}`}>
                                        <img src={v.img} className="absolute inset-0 w-full h-full object-cover brightness-[0.7] group-hover:scale-110 transition-all duration-1000" alt={v.label} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                                        <div className="absolute bottom-12 left-0 right-0 px-8 text-center">
                                            <h4 className="text-4xl font-serif-headline mb-3 leading-tight">{v.label}</h4>
                                            <p className="text-[#B3A369] font-inter text-[11px] tracking-[0.4em] uppercase font-black">{v.tags}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {selections.vibes.length > 0 && <button onClick={() => setStep(4)} className="px-14 py-4 rounded-full bg-[#B3A369] text-black font-black uppercase text-xs tracking-widest shadow-xl">Next Step</button>}
                        </motion.div>
                    )}

                    {/* STEP 4: PARAMETERS (STRICT $10 INCREMENTS) */}
                    {step === 4 && (
                        <motion.div key="logistics" className="w-full max-w-2xl text-center">
                            <h3 className="text-6xl font-serif-headline mb-20 italic text-[#B3A369]">Fine Tuning</h3>
                            <div className="space-y-24">
                                <div>
                                    <div className="flex justify-between items-end mb-6 px-2">
                                        <span className="text-xs text-[#B3A369] uppercase tracking-[0.4em] font-black">Radius</span>
                                        <span className="text-5xl font-serif-headline">{selections.radius} Mi</span>
                                    </div>
                                    <input type="range" min="1" max="50" value={selections.radius} onChange={(e) => updateSelection('radius', e.target.value)} className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#B3A369]" />
                                </div>
                                <div>
                                    <div className="flex justify-between items-end mb-6 px-2">
                                        <span className="text-xs text-[#B3A369] uppercase tracking-[0.4em] font-black">Budget</span>
                                        <span className="text-5xl font-serif-headline">{formatCurrency(Number(selections.budget))}</span>
                                    </div>
                                    
                                    {/* FIXED STEP TO 10 FOR ALL VALUES */}
                                    <input 
                                        type="range" 
                                        min="10" 
                                        max="100000" 
                                        step="10" 
                                        value={selections.budget} 
                                        onChange={(e) => updateSelection('budget', e.target.value)} 
                                        className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#B3A369]" 
                                    />

                                    {Number(selections.budget) >= 10000 && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[#B3A369] text-[10px] font-black tracking-[0.3em] uppercase mt-6">
                                            ✨ Platinum Experience Tier ✨
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setStep(5)} className="mt-24 px-16 py-5 rounded-full bg-white text-black font-black uppercase text-xs tracking-[0.4em]">Generate Experience</button>
                        </motion.div>
                    )}

                    {/* STEP 5: FINAL BRIDGE */}
                    {step === 5 && (
                        <motion.div key="final" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-3xl bg-black/50 p-20 rounded-[5rem] backdrop-blur-3xl border border-white/10 shadow-2xl">
                            <h3 className="text-8xl font-serif-headline mb-8 text-[#B3A369] italic font-bold leading-tight">Ready to Roll.</h3>
                            <p className="text-white/80 mb-14 font-inter leading-relaxed text-xl px-10">
                                Your custom Queen City pulse is synchronized! We've mapped out the perfect {formatTime(Number(selections.hours))} journey for your {selections.persona} with a {formatCurrency(Number(selections.budget))} budget.
                            </p>
                            <button onClick={() => window.location.href='/signin'} className="px-14 py-6 rounded-full bg-[#B3A369] text-black font-black uppercase text-sm tracking-[0.4em] hover:scale-105 transition-all">
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