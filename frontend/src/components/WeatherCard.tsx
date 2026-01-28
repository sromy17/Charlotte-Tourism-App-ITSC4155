import React from 'react';
import { WeatherData } from '../types';

interface WeatherCardProps {
	weather: WeatherData;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ weather }) => {
	return (
		<div
			className={
				`bg-white rounded-lg shadow-lg p-8 transition-all ` +
				(weather.is_risky_for_outdoor ? 'border-4 border-red-500 animate-pulse-red' : '')
			}
		>
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-4xl font-bold text-gray-800">
						{Math.round(weather.temperature)}°F
					</h2>
					<div className="text-xl text-uncc-green capitalize mt-2">
						{weather.description}
					</div>
					<div className="text-sm text-gray-500 mt-1">
						Feels like: {Math.round(weather.feels_like)}°F · Humidity: {weather.humidity}%
					</div>
				</div>
				<div>
					<img
						src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`}
						alt={weather.description + ' icon'}
						className="w-24 h-24"
					/>
				</div>
			</div>
			{weather.is_risky_for_outdoor && weather.risk_reason && (
				<div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
					<div className="flex items-center">
						<span className="text-2xl mr-2" role="img" aria-label="Warning">⚠️</span>
						<span className="text-red-700 font-semibold">{weather.risk_reason}</span>
					</div>
				</div>
			)}
		</div>
	);
};

export default WeatherCard;
