import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
    const location = useLocation();
    
    return (
        <div className="fixed top-6 inset-x-0 z-[100] flex justify-center px-6">
            <nav className="relative flex items-center justify-between w-full max-w-7xl h-16 px-8 rounded-full border thin-border border-white/20 bg-black/35 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.45)] overflow-hidden">
                <div className="absolute inset-0 border thin-border border-[#004D2C]/35 rounded-full animate-border-trace pointer-events-none" />

                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-2 h-2 rounded-full bg-royal-emerald group-hover:shadow-[0_0_15px_#004D2C] transition-all" />
                    <span className="text-sm font-semibold uppercase tracking-[0.34em] font-inter text-[#F6F3EB]">
                        CLT<span className="text-fairway-gold">ourism</span>
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    {[
                        { name: 'Get Started', path: '/plan' },
                        { name: 'Experiences', path: '/safari' },
                        { name: 'City Map', path: '/map' },
                        { name: 'Itinerary', path: '/itinerary' }
                    ].map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`text-[10px] uppercase tracking-[0.28em] font-semibold transition-all hover:text-fairway-gold ${
                                location.pathname === item.path ? 'text-royal-emerald' : 'text-white/40'
                            }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                <Link to="/profile" className="flex items-center gap-4 group">
                    <div className="h-px w-8 bg-white/10 group-hover:w-12 transition-all" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">Profile</span>
                </Link>
            </nav>
        </div>
    );
};

export default Navbar;