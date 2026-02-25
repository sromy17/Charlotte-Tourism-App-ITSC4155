import React from 'react';
// Import the type directly from your central types file to keep everything in sync
import { WeatherData } from '../types'; 

interface WeatherCardProps {
    // This now uses the exact type defined in your project
    weather: WeatherData; 
}

const WeatherCard: React.FC<WeatherCardProps> = ({ weather }) => {
    return (
        <div
            className={
                `bg-dark-surface rounded-2xl shadow-2xl p-8 transition-all duration-300 border border-slate-700/50 ` +
                (weather.is_risky_for_outdoor 
                    ? 'border-red-500/50 ring-4 ring-red-500/10 animate-pulse-red' 
                    : 'hover:border-uncc-green/50')
            }
            style={{ fontFamily: 'Inter, sans-serif' }}
        >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                    <h2 className="text-6xl font-extrabold text-white tracking-tighter" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.04em' }}>
                        {Math.round(weather.temperature)}°F
                    </h2>
                    <div className="text-xl text-emerald-400 font-semibold capitalize mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {weather.description}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-400 mt-4 flex flex-wrap justify-center md:justify-start gap-4" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                        <span className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                            Feels like: <span className="text-slate-100">{Math.round(weather.feels_like)}°F</span>
                        </span>
                        <span className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                            Humidity: <span className="text-slate-100">{weather.humidity}%</span>
                        </span>
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-uncc-green/20 blur-3xl rounded-full"></div>
                    <img
                        src={`http://openweathermap.org/img/wn/${weather.icon}@4x.png`}
                        alt={weather.description}
                        className="relative w-32 h-32 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                    />
                </div>
            </div>

            {/* Note the change here: we check if risk_reason exists before rendering */}
            {weather.is_risky_for_outdoor && weather.risk_reason && (
                <div className="mt-8 bg-red-950/40 border border-red-500/30 p-5 rounded-xl backdrop-blur-sm" style={{ fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                    <div className="flex items-start">
                        <span className="text-2xl mr-4 mt-1" role="img" aria-label="Warning">⚠️</span>
                        <div>
                            <h4 className="text-red-400 font-bold text-xs sm:text-sm uppercase tracking-widest">Weather Advisory</h4>
                            <p className="text-red-200/80 text-xs sm:text-sm mt-1 leading-relaxed">
                                {weather.risk_reason}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeatherCard;