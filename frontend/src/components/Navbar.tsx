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
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
