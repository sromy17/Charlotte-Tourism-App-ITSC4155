import React, { useEffect, useState } from 'react';
import { weatherService } from '../services/weatherService';
import { WeatherData } from '../types';
import WeatherCard from '../components/WeatherCard';
import { useCallback } from 'react';

const Home: React.FC = () => {
	const [weather, setWeather] = useState<WeatherData | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	// Simple fetch for /api/weather/charlotte to display temp, description and risk
	const [charlotteWeather, setCharlotteWeather] = useState<{
		temperature?: number;
		description?: string;
		is_risky_for_outdoor?: boolean;
		risk_reason?: string;
	} | null>(null);

	useEffect(() => {
		const fetchCharlotte = async () => {
			try {
				const res = await fetch('http://localhost:8000/api/weather/charlotte');
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const json = await res.json();
				setCharlotteWeather({
					temperature: json.temperature ?? json.temp,
					description: json.description ?? json.desc,
					is_risky_for_outdoor: json.is_risky_for_outdoor,
					risk_reason: json.risk_reason,
				});
			} catch (err) {
				console.error('Failed to fetch charlotte weather', err);
			}
		};

		fetchCharlotte();
	}, []);

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
			{/* Quick test panel for backend weather endpoint */}
			<div className="fixed top-4 right-4 bg-white/5 backdrop-blur-sm p-3 rounded shadow-lg">
				<TestWeather />
			</div>
			<div className="container mx-auto px-4 py-12">
				<section className="text-center mb-12">
					<h1 className="text-5xl font-bold text-uncc-green mb-4">
						Welcome to CLTourism
					</h1>
					{charlotteWeather?.temperature != null && (
						<div className="text-2xl font-semibold text-uncc-green">
							Charlotte temp: {charlotteWeather.temperature}°F
							{charlotteWeather.description && (
								<div className="text-lg font-medium">{charlotteWeather.description}</div>
							)}
							{charlotteWeather.is_risky_for_outdoor && charlotteWeather.risk_reason && (
								<div className="text-red-400 font-semibold">{charlotteWeather.risk_reason}</div>
							)}
						</div>
					)}
					<p className="text-xl text-uncc-green">
						Your Smart Companion for Exploring Charlotte
					</p>
				</section>
				<section className="max-w-2xl mx-auto mb-16">
					{loading && (
						<div className="flex items-center justify-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-uncc-green mr-3"></div>
							<span className="text-uncc-green">Loading weather data...</span>
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
						<p className="text-uncc-green">
							Get real-time weather-based recommendations for your Charlotte adventures.
						</p>
					</div>
					<div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition">
						<div className="text-4xl mb-4">🗺️</div>
						<h2 className="text-2xl font-bold mb-2 text-uncc-green">Interactive Maps</h2>
						<p className="text-uncc-green">
							Explore Charlotte with live traffic, attractions, and more on our interactive map.
						</p>
					</div>
					<div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition">
						<div className="text-4xl mb-4">📅</div>
						<h2 className="text-2xl font-bold mb-2 text-uncc-green">Smart Itineraries</h2>
						<p className="text-uncc-green">
							Plan your trip with personalized, weather-aware itineraries and activities.
						</p>
					</div>
				</section>
			</div>
		</div>
	);
};

export default Home;


const TestWeather: React.FC = () => {
	const [data, setData] = React.useState<{
		temperature?: number;
		description?: string;
		city?: string;
		is_risky_for_outdoor?: boolean;
		risk_reason?: string;
	} | null>(null);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	const fetchWeather = useCallback(async () => {
		setLoading(true);
		setError(null);
			try {
				const res = await fetch('http://localhost:8000/api/weather/charlotte');
				if (!res.ok) throw new Error(`Status ${res.status}`);
				const json = await res.json();
				setData({
					temperature: json.temperature ?? json.temp,
					description: json.description ?? json.desc,
					city: json.city,
					is_risky_for_outdoor: json.is_risky_for_outdoor,
					risk_reason: json.risk_reason,
				});
			} catch (err: any) {
			setError(err.message || String(err));
		} finally {
			setLoading(false);
		}
	}, []);

	return (
		<div className="text-left text-uncc-green">
			<button onClick={fetchWeather} className="bg-uncc-green text-white px-3 py-1 rounded">
				Test Charlotte Weather
			</button>
			{loading && <div className="mt-2">Loading…</div>}
			{error && <div className="mt-2 text-red-400">Error: {error}</div>}
			{data && (
				<div className="mt-2 text-uncc-green">
					{data.city && <div>City: {data.city}</div>}
					{data.temperature != null && <div>Temp: {data.temperature}°F</div>}
					{data.description && <div>Desc: {data.description}</div>}
					{data.is_risky_for_outdoor && data.risk_reason && (
						<div className="text-red-400">{data.risk_reason}</div>
					)}
				</div>
			)}
		</div>
	);
};
