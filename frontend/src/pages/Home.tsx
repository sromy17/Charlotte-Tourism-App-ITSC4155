import React, { useEffect, useState } from 'react';
import { weatherService } from '../services/weatherService';
import { WeatherData } from '../types';
import WeatherCard from '../components/WeatherCard';

const Home: React.FC = () => {
	const [weather, setWeather] = useState<WeatherData | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchWeather = async () => {
			try {
				const data = await weatherService.getCurrentWeather();
				setWeather(data);
				setLoading(false);
			} catch (err) {
				console.error('Failed to fetch weather:', err);
				setError('Unable to load weather data. Please try again later.');
				setLoading(false);
			}
		};
		fetchWeather();
	}, []);

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-4 py-12">
				<section className="text-center mb-12">
					<h1 className="text-5xl font-bold text-uncc-green mb-4">
						Welcome to CLTourism
					</h1>
					<p className="text-xl text-gray-600">
						Your Smart Companion for Exploring Charlotte
					</p>
				</section>
				<section className="max-w-2xl mx-auto mb-16">
					{loading && (
						<div className="flex items-center justify-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-uncc-green mr-3"></div>
							<span className="text-gray-600">Loading weather data...</span>
						</div>
					)}
					{error && (
						<div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
							{error}
						</div>
					)}
					{weather && <WeatherCard weather={weather} />}
				</section>
				<section className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
					<div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition">
						<div className="text-4xl mb-4">🌤️</div>
						<h2 className="text-2xl font-bold mb-2 text-uncc-green">Weather-Optimized</h2>
						<p className="text-gray-600">
							Get real-time weather-based recommendations for your Charlotte adventures.
						</p>
					</div>
					<div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition">
						<div className="text-4xl mb-4">🗺️</div>
						<h2 className="text-2xl font-bold mb-2 text-uncc-green">Interactive Maps</h2>
						<p className="text-gray-600">
							Explore Charlotte with live traffic, attractions, and more on our interactive map.
						</p>
					</div>
					<div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition">
						<div className="text-4xl mb-4">📅</div>
						<h2 className="text-2xl font-bold mb-2 text-uncc-green">Smart Itineraries</h2>
						<p className="text-gray-600">
							Plan your trip with personalized, weather-aware itineraries and activities.
						</p>
					</div>
				</section>
			</div>
		</div>
	);
};

export default Home;
