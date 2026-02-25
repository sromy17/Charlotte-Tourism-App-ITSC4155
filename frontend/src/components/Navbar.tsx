import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
	return (
		<nav className="bg-uncc-green text-white shadow-lg">
			<div className="container mx-auto px-4">
				<div className="flex justify-between items-center h-16">
					<Link
						to="/"
						className="text-2xl font-bold hover:text-uncc-gold transition duration-200"
						aria-label="CLTourism Home"
					>
						🏙️ CLTourism
					</Link>
					<div className="flex space-x-6">
						<Link
							to="/"
							className="hover:text-uncc-gold transition duration-200"
						>
							Home
						</Link>
						<Link
							to="/map"
							className="hover:text-uncc-gold transition duration-200"
						>
							Map
						</Link>
						<Link
							to="/itinerary"
							className="hover:text-uncc-gold transition duration-200"
						>
							My Itinerary
						</Link>
						<Link
							to="/profile"
							className="hover:text-uncc-gold transition duration-200"
						>
							Profile
						</Link>
						<Link
							to="/login"
							className="hover:text-uncc-gold transition duration-200"
						>
							Login
						</Link>
					</div>
				</div>
			</div>
		</nav>
	);
    return (
        <nav className="sticky top-0 z-50 bg-dark-bg/90 backdrop-blur-xl border-b border-white/10">
            {/* Visual Flair: Animated Gradient Line at the very top */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-uncc-green to-uncc-gold opacity-50"></div>
            
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-center h-20">
                    {/* Logo with Glow Effect */}
                    <Link to="/" className="group relative flex items-center gap-3">
                        <div className="absolute -inset-2 bg-uncc-green/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <span className="text-3xl relative">🏙️</span>
                        <div className="relative flex flex-col tracking-tighter">
                            <span className="text-2xl font-black leading-none">
                                <span className="text-uncc-green">CLT</span>
                                <span className="text-uncc-gold">ourism</span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Queen City</span>
                        </div>
                    </Link>

                    {/* Navigation with Animated Links */}
                    <div className="hidden md:flex items-center space-x-10">
                        {['Home', 'Map', 'Itinerary'].map((item) => (
                            <Link
                                key={item}
                                to={item === 'Home' ? '/home' : `/${item.toLowerCase()}`}
                                className="relative text-slate-400 hover:text-white font-bold text-xs uppercase tracking-widest group transition-colors duration-300"
                            >
                                {item}
                                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-uncc-green transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                        ))}
                        
                        {/* Profile Button with Inner Glow */}
                        <Link to="/profile" className="relative px-6 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 group overflow-hidden border border-white/10">
                            <span className="absolute inset-0 bg-slate-800 group-hover:bg-uncc-green transition-colors duration-500"></span>
                            <span className="relative z-10 text-slate-200 group-hover:text-white">Profile</span>
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;