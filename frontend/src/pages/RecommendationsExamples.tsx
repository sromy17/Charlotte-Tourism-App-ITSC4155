/**
 * USAGE EXAMPLE: How to Use the New Recommendations API
 * 
 * This file shows how to integrate the new recommendation system into your components
 */

import React, { useState } from 'react';
import { fetchRecommendations } from '../services/api';
import { useExperienceStore } from '../state/experienceStore';
import RecommendationCard from '../components/RecommendationCard';

/**
 * Example Component: Recommendations Page
 * 
 * Shows how to:
 * 1. Fetch recommendations from the backend
 * 2. Store them in Zustand
 * 3. Display them using RecommendationCard
 */
const RecommendationsExample: React.FC = () => {
	const [vibe, setVibe] = useState('food_and_culture');
	const [date, setDate] = useState('2026-05-15');
	const [budget, setBudget] = useState(150);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Get store actions
	const { apiRecommendations, setApiRecommendations } = useExperienceStore();

	// Fetch recommendations
	const handleFetch = async () => {
		setLoading(true);
		setError(null);

		try {
			const data = await fetchRecommendations(vibe, date, budget);
			setApiRecommendations(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
			setApiRecommendations(null);
		} finally {
			setLoading(false);
		}
	};

	// Render recommendations by category
	const renderCategory = (title: string, items: any[]) => {
		if (items.length === 0) return null;

		return (
			<div key={title} className="mb-12">
				<h2 className="text-lg font-semibold text-white mb-4 uppercase tracking-widest">
					{title} <span className="text-fairway-gold">({items.length})</span>
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{items.map((item, idx) => (
						<RecommendationCard
							key={item.id}
							item={item}
							index={idx}
							onClick={() => console.log('Selected:', item.name)}
						/>
					))}
				</div>
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-black text-white p-8">
			{/* Header */}
			<div className="max-w-7xl mx-auto">
				<h1 className="text-4xl font-serif-headline italic mb-8">
					Find Your <span className="text-royal-emerald">Perfect Day</span>
				</h1>

				{/* Controls */}
				<div className="mb-12 grid grid-cols-1 md:grid-cols-4 gap-4">
					{/* Vibe Selector */}
					<div>
						<label className="block text-xs uppercase tracking-widest text-white/60 mb-2">
							Vibe
						</label>
						<select
							value={vibe}
							onChange={(e) => setVibe(e.target.value)}
							className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-royal-emerald"
						>
							<option value="food_and_culture">Food & Culture</option>
							<option value="social_weekend">Social Weekend</option>
							<option value="leisure_and_luxury">Leisure & Luxury</option>
							<option value="city_explorer">City Explorer</option>
						</select>
					</div>

					{/* Date Selector */}
					<div>
						<label className="block text-xs uppercase tracking-widest text-white/60 mb-2">
							Date
						</label>
						<input
							type="date"
							value={date}
							onChange={(e) => setDate(e.target.value)}
							className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-royal-emerald"
						/>
					</div>

					{/* Budget Selector */}
					<div>
						<label className="block text-xs uppercase tracking-widest text-white/60 mb-2">
							Budget (${budget})
						</label>
						<input
							type="range"
							min={50}
							max={500}
							step={25}
							value={budget}
							onChange={(e) => setBudget(Number(e.target.value))}
							className="w-full"
						/>
					</div>

					{/* Fetch Button */}
					<div className="flex items-end">
						<button
							onClick={handleFetch}
							disabled={loading}
							className="w-full px-4 py-2 rounded-lg bg-royal-emerald/20 border border-royal-emerald/50 text-royal-emerald uppercase text-xs font-bold tracking-widest hover:bg-royal-emerald/30 disabled:opacity-50 transition-all"
						>
							{loading ? 'Loading...' : 'Generate'}
						</button>
					</div>
				</div>

				{/* Weather Info */}
				{apiRecommendations?.weather && (
					<div className="mb-8 p-4 rounded-lg border border-white/10 bg-white/5">
						<p className="text-sm text-white">
							<span className="font-semibold">Weather:</span> {apiRecommendations.weather.is_rainy ? '🌧️ Rainy' : '☀️ Clear'} · 
							Conditions: {apiRecommendations.weather.conditions.join(', ')} · 
							Rain probability: {(apiRecommendations.weather.rain_probability * 100).toFixed(0)}%
						</p>
					</div>
				)}

				{/* Error Message */}
				{error && (
					<div className="mb-8 p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
						{error}
					</div>
				)}

				{/* Recommendations */}
				{apiRecommendations && (
					<div>
						{renderCategory('🍽️ Restaurants', apiRecommendations.restaurants)}
						{renderCategory('🎯 Activities', apiRecommendations.activities)}
						{renderCategory('🎭 Events', apiRecommendations.events)}

						{(!apiRecommendations.restaurants.length &&
							!apiRecommendations.activities.length &&
							!apiRecommendations.events.length) && (
							<div className="text-center py-12">
								<p className="text-white/60">No recommendations found. Try adjusting your filters.</p>
							</div>
						)}
					</div>
				)}

				{/* No Results Yet */}
				{!apiRecommendations && !loading && (
					<div className="text-center py-12 text-white/40">
						<p>Select your preferences and click "Generate" to see recommendations</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default RecommendationsExample;


/**
 * ADDITIONAL EXAMPLES
 */

// ============================================
// Example 1: Compact Grid Display
// ============================================
export const CompactRecommendationGrid: React.FC = () => {
	const { apiRecommendations } = useExperienceStore();

	if (!apiRecommendations) return null;

	const allItems = [
		...apiRecommendations.restaurants,
		...apiRecommendations.activities,
		...apiRecommendations.events,
	];

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
			{allItems.map((item, idx) => (
				<RecommendationCard
					key={item.id}
					item={item}
					index={idx}
					variant="compact"
				/>
			))}
		</div>
	);
};


// ============================================
// Example 2: Hook for Auto-fetching
// ============================================
export const useFetchRecommendations = (vibe: string, date: string, budget: number) => {
	const { apiRecommendations, setApiRecommendations, setLoading, setError } = useExperienceStore();
	const [isLoading, setIsLoading] = useState(false);

	const fetch = async () => {
		setIsLoading(true);
		setLoading(true);

		try {
			const data = await fetchRecommendations(vibe, date, budget);
			setApiRecommendations(data);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to fetch');
			setApiRecommendations(null);
		} finally {
			setIsLoading(false);
			setLoading(false);
		}
	};

	return { recommendations: apiRecommendations, isLoading, fetch };
};


// ============================================
// Example 3: Integration with Itinerary Page
// ============================================
export const ItineraryWithRecommendations: React.FC = () => {
	const { apiRecommendations } = useExperienceStore();

	// Example: Use recommendations to auto-populate itinerary
	const items = apiRecommendations?.restaurants || [];

	return (
		<div className="space-y-4">
			{items.slice(0, 5).map((item) => (
				<div key={item.id} className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
					<h4 className="font-semibold text-white">{item.name}</h4>
					<p className="text-sm text-white/60">{item.location}</p>
					{item.price && <p className="text-xs text-fairway-gold mt-2">{item.price}</p>}
				</div>
			))}
		</div>
	);
};
