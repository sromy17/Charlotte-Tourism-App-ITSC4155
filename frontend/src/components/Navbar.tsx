import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
    return (
        <nav className="sticky top-0 z-50 bg-[#080808]/90 backdrop-blur-xl border-b border-white/10">
            {/* Elegant Top Gradient Line */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#00703C] to-[#B3A369] opacity-50"></div>
            
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-center h-20">
                    
                    {/* Logo: Mixing the Serif vibe with Bold UI */}
                    <Link to="/" className="group relative flex items-center gap-3">
                        <div className="absolute -inset-2 bg-[#00703C]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <span className="text-3xl relative">🏙️</span>
                        <div className="relative flex flex-col tracking-tighter">
                            <span className="text-2xl font-black leading-none font-inter">
                                <span className="text-[#00703C]">CLT</span>
                                <span className="text-[#B3A369]">ourism</span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1 font-inter">Queen City</span>
                        </div>
                    </Link>

                    {/* Navigation: Clean Inter Font */}
                    <div className="hidden md:flex items-center space-x-10">
                        {[
                            { name: 'Home', path: '/' },
                            { name: 'Map', path: '/map' },
                            { name: 'Itinerary', path: '/itinerary' },
                            { name: 'Login', path: '/login' }
                        ].map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className="relative text-slate-400 hover:text-white font-bold text-xs uppercase tracking-widest group transition-colors duration-300 font-inter"
                            >
                                {item.name}
                                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-[#00703C] transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                        ))}
                        
                        {/* Profile Button - Standout Look */}
                        <Link to="/profile" className="relative px-6 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 group overflow-hidden border border-white/10 font-inter">
                            <span className="absolute inset-0 bg-slate-800 group-hover:bg-[#00703C] transition-colors duration-500"></span>
                            <span className="relative z-10 text-slate-200 group-hover:text-white">Profile</span>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;