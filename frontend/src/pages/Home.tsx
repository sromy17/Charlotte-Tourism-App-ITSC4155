import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [selections, setSelections] = useState({
        arrival: '',
        persona: '',
        budget: 500,
        hours: 24,
        protocol: 'Standard'
    });

    // WORLD SHIFT COORDINATES
    // As you change steps, the background "moves" to a different sector
    const getWorldTransform = () => {
        switch(step) {
            case 0: return { x: '0%', y: '0%', rotate: 0 };
            case 1: return { x: '15%', y: '-10%', rotate: 2 }; // Shift to Sector Alpha
            case 2: return { x: '-15%', y: '10%', rotate: -2 }; // Shift to Sector Beta
            case 3: return { x: '0%', y: '20%', rotate: 0 };   // Shift to Sector Gamma
            default: return { x: '0%', y: '0%' };
        }
    };

    const personas = [
        { id: 'soloist', name: 'The Soloist', img: '/img/soloist.jpg', desc: 'Individualized high-focus exploration' },
        { id: 'competitor', name: 'The Competitor', img: '/img/competitor.webp', desc: 'Peak energy & adrenaline-led discovery' }
    ];

    const executeFinalProtocol = (protocol: string) => {
        const finalData = { ...selections, protocol };
        setIsProcessing(true);
        setTimeout(() => {
            navigate('/itinerary', { state: { selections: finalData } });
        }, 3200);
    };

    return (
        <div className="relative h-screen w-full bg-[#020202] text-white overflow-hidden font-inter">
            
            {/* THE SHIFTING WORLD (The Background that moves) */}
            <motion.div 
                animate={getWorldTransform()}
                transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 w-[150%] h-[150%] -left-[25%] -top-[25%] pointer-events-none"
            >
                {/* Tactical Grid */}
                <div className="absolute inset-0 opacity-10" 
                     style={{ backgroundImage: `linear-gradient(#ffffff10 1px, transparent 1px), linear-gradient(90deg, #ffffff10 1px, transparent 1px)`, backgroundSize: '80px 80px' }} 
                />
                {/* Ambient Glows that move with the world */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-royal-emerald/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-royal-gold/5 rounded-full blur-[150px]" />
            </motion.div>

            {/* CENTERED CONTENT ENGINE */}
            <div className="relative z-10 flex items-center justify-center h-full w-full">
                <AnimatePresence mode="wait">
                    
                    {/* STEP 0: HERO */}
                    {step === 0 && (
                        <motion.div 
                            key="s0"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                            className="text-center"
                        >
                            <h1 className="text-[10vw] font-serif-headline italic leading-none tracking-tighter">
                                CLT<span className="text-royal-emerald">OURISM</span>
                            </h1>
                            <p className="text-[10px] uppercase tracking-[1em] text-white/20 mt-4 mb-16">Global_Executive_Interface</p>
                            <button 
                                onClick={() => setStep(1)}
                                className="px-16 py-5 rounded-full border border-white/10 hover:border-royal-emerald transition-all text-[11px] font-black uppercase tracking-[0.3em] bg-black/50 backdrop-blur-md"
                            >
                                Start Protocol
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 1: TEMPORAL SYNC */}
                    {step === 1 && (
                        <motion.div 
                            key="s1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="w-full max-w-2xl px-6 text-center"
                        >
                            <span className="text-royal-emerald font-black text-[10px] tracking-[0.5em] uppercase">Temporal_Parameters</span>
                            <h2 className="text-5xl font-serif-headline italic mt-6 mb-12">When do we arrive?</h2>
                            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-12 backdrop-blur-2xl shadow-2xl">
                                <input 
                                    type="date" 
                                    className="bg-transparent text-5xl font-bold outline-none text-royal-gold w-full text-center invert brightness-200" 
                                    onChange={(e) => setSelections({...selections, arrival: e.target.value})} 
                                />
                                <button 
                                    onClick={() => setStep(2)}
                                    className="mt-12 text-royal-emerald font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors"
                                >
                                    Define Persona →
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: IDENTITY MATRIX */}
                    {step === 2 && (
                        <motion.div 
                            key="s2"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="w-full max-w-5xl px-6 text-center"
                        >
                            <h2 className="text-4xl font-serif-headline italic mb-16 uppercase tracking-widest">Select Operational Identity</h2>
                            <div className="grid grid-cols-2 gap-10 h-[50vh]">
                                {personas.map((p) => (
                                    <motion.div 
                                        key={p.id}
                                        whileHover={{ y: -15, borderColor: 'rgba(0, 77, 44, 0.5)' }}
                                        onClick={() => { setSelections({...selections, persona: p.name}); setStep(3); }}
                                        className="group relative cursor-pointer rounded-[3rem] overflow-hidden border border-white/5 bg-zinc-900/50 backdrop-blur-md"
                                    >
                                        <img src={p.img} alt={p.name} className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-1000" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                        <div className="absolute bottom-10 left-10 text-left">
                                            <h3 className="text-4xl font-serif-headline italic">{p.name}</h3>
                                            <p className="text-[10px] uppercase tracking-widest text-white/40 mt-2">{p.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: LOGISTICS & PROTOCOL */}
                    {step === 3 && (
                        <motion.div 
                            key="s3"
                            initial={{ opacity: 0, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, filter: 'blur(0px)' }}
                            className="w-full max-w-2xl px-6 text-center"
                        >
                            <h2 className="text-5xl font-serif-headline italic mb-12">Final Logistics</h2>
                            <div className="bg-white/5 border border-white/10 rounded-[3.5rem] p-12 backdrop-blur-3xl mb-8">
                                <div className="flex justify-between mb-8">
                                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-black">Capital Allocation</span>
                                    <span className="text-royal-emerald font-black text-2xl tracking-tighter">${selections.budget}</span>
                                </div>
                                <input 
                                    type="range" min="100" max="3000" step="100"
                                    value={selections.budget}
                                    onChange={(e) => setSelections({...selections, budget: parseInt(e.target.value)})}
                                    className="w-full h-[2px] bg-white/10 accent-royal-emerald appearance-none cursor-pointer"
                                />
                            </div>
                            <div className="flex gap-4">
                                {['Leisure', 'Standard', 'High-Velocity'].map(p => (
                                    <button 
                                        key={p}
                                        onClick={() => executeFinalProtocol(p)}
                                        className="flex-1 py-6 rounded-2xl border border-white/10 hover:border-royal-emerald hover:bg-royal-emerald/5 transition-all uppercase text-[10px] font-black tracking-widest"
                                    >
                                        {p} Protocol
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* PROCESSING OVERLAY */}
            <AnimatePresence>
                {isProcessing && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center"
                    >
                        <div className="relative">
                            <motion.div 
                                animate={{ width: ['0%', '100%', '0%'], left: ['0%', '0%', '100%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-4 h-[1px] bg-royal-emerald shadow-[0_0_15px_#004D2C]"
                            />
                            <p className="text-royal-emerald font-mono text-[10px] tracking-[0.8em] uppercase">Processing_CLTourism_Matrix</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;