import React, { useState, useMemo } from 'react';
import { Event } from '../types';

const EventSearch: React.FC = () => {
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [radius, setRadius] = useState<number>(25);
	const [dateFilter, setDateFilter] = useState<string>('all');
	const [results, setResults] = useState<Event[]>([]);
	const [hasSearched, setHasSearched] = useState<boolean>(false);

	// Haversine formula to calculate distance between two points (lat/lon)
	const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
		const R = 3959; // Earth's radius in miles
		const dLat = ((lat2 - lat1) * Math.PI) / 180;
		const dLon = ((lon2 - lon1) * Math.PI) / 180;
		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos((lat1 * Math.PI) / 180) *
				Math.cos((lat2 * Math.PI) / 180) *
				Math.sin(dLon / 2) *
				Math.sin(dLon / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	};

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		setHasSearched(true);

		try {
			// TODO: Replace with actual Ticketmaster API call once API key is configured
			// const response = await api.get('/events/search', {
			//   params: {
			//     lat: 35.2271,
			//     lon: -80.8431,
			//     radius: radius,
			//     start_date_time: getStartDateTime(),
			//     end_date_time: getEndDateTime()
			//   }
			// });
			// setResults(response.data);

			// For now, show empty results until API is connected
			setResults([]);
		} catch (error) {
			console.error('Error searching events:', error);
			setResults([]);
		}
	};

	return (
		<section className="max-w-6xl mx-auto mb-16">
			<h2 className="text-3xl font-bold text-uncc-green mb-8 text-center">Find Events</h2>

			{/* Search Form */}
			<form onSubmit={handleSearch} className="bg-white rounded-lg shadow-lg p-8 mb-8">
				{/* Search Bar */}
				<div className="mb-6">
					<label className="block text-gray-700 font-semibold mb-2">Search Events</label>
					<div className="flex gap-3">
						<input
							type="text"
							placeholder="Search by event name, type, or location..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:border-uncc-green focus:outline-none focus:ring-2 focus:ring-uncc-green focus:ring-opacity-50"
						/>
						<button
							type="submit"
							className="px-6 py-3 bg-uncc-green text-white font-semibold rounded-lg hover:opacity-90 transition"
						>
							Search
						</button>
					</div>
				</div>

				{/* Filters */}
				<div className="grid md:grid-cols-2 gap-4">
					{/* Distance Filter */}
					<div>
						<label className="block text-gray-700 font-semibold mb-2">Search Radius</label>
						<select
							value={radius}
							onChange={(e) => setRadius(Number(e.target.value))}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-uncc-green focus:outline-none"
						>
							<option value={5}>5 miles</option>
							<option value={10}>10 miles</option>
							<option value={25}>25 miles</option>
							<option value={50}>50 miles</option>
						</select>
					</div>

					{/* Date Filter */}
					<div>
						<label className="block text-gray-700 font-semibold mb-2">When</label>
						<select
							value={dateFilter}
							onChange={(e) => setDateFilter(e.target.value)}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-uncc-green focus:outline-none"
						>
							<option value="all">All Dates</option>
							<option value="today">Today</option>
							<option value="week">This Week</option>
							<option value="weekend">This Weekend</option>
							<option value="month">This Month</option>
						</select>
					</div>
				</div>
			</form>

			{/* Results Section */}
			{hasSearched ? (
				<div>
					{results.length > 0 ? (
						<div className="space-y-4">
							<p className="text-gray-600 mb-4">
								Found {results.length} event{results.length !== 1 ? 's' : ''}
							</p>
							{results.map((event) => (
								<div
									key={event.id}
									className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition"
								>
									<div className="flex justify-between items-start">
										<div className="flex-1">
											<h3 className="text-xl font-bold text-uncc-green mb-2">
												{event.name}
											</h3>
											<div className="space-y-1 text-gray-600">
												<p>📅 {event.date} at {event.time || 'TBA'}</p>
												<p>📍 {event.venue.name}, {event.venue.city}, {event.venue.state}</p>
												<p>🎭 {event.type}</p>
											</div>
										</div>
										<a
											href={event.url || '#'}
											target="_blank"
											rel="noopener noreferrer"
											className="px-4 py-2 bg-uncc-green text-white font-semibold rounded-lg hover:opacity-90 transition"
										>
											View Tickets
										</a>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="bg-white rounded-lg shadow-lg p-12 text-center">
							<p className="text-gray-600 text-lg">
								No events found. {searchTerm ? 'Try adjusting your search or ' : ''}Enter a search term
								to find events in Charlotte.
							</p>
							<p className="text-gray-500 text-sm mt-2">
								(Live event data will be available once Ticketmaster API is configured)
							</p>
						</div>
					)}
				</div>
			) : (
				<div className="bg-white rounded-lg shadow-lg p-12 text-center">
					<p className="text-gray-600 text-lg">
						Use the search bar above to find events happening in Charlotte
					</p>
					<p className="text-gray-500 text-sm mt-2">
						Search by event name, artist, venue, or type
					</p>
				</div>
			)}
		</section>
	);
};

export default EventSearch;
