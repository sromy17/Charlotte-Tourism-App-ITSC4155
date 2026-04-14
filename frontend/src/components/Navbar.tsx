import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // ✅ FIX: read real login state from localStorage
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const isSignedIn = !!user;

    const accountPath = isSignedIn ? '/profile' : '/login';
    const accountLabel = isSignedIn ? 'Profile' : 'Sign In';

    const handleSignOut = () => {
        localStorage.removeItem('user'); // ✅ clear login
        navigate('/');
        window.location.reload(); // ✅ force navbar refresh
    };

    return (
        <div className="fixed top-6 inset-x-0 z-[100] flex justify-center px-6">
            <nav className="relative flex items-center justify-between w-full max-w-7xl h-16 px-5 sm:px-8 rounded-full border thin-border border-white/20 bg-black/35 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.45)] overflow-hidden">

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
                                location.pathname === item.path
                                    ? 'text-royal-emerald'
                                    : 'text-white/40'
                            }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-3 sm:gap-4">

                    {isSignedIn && (
                        <button
                            type="button"
                            onClick={handleSignOut}
                            className="rounded-full border border-white/20 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.18em] text-white/75 transition hover:border-[#d6c08e]/45 hover:text-[#F6F3EB]"
                        >
                            Sign Out
                        </button>
                    )}

                    <Link to={accountPath} className="flex items-center gap-4 group">
                        <div className="h-px w-8 bg-white/10 group-hover:w-12 transition-all" />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                            {accountLabel}
                        </span>
                    </Link>
                </div>

            </nav>
        </div>
    );
};

export default Navbar;