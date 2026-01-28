import api from './api';
import { WeatherData } from '../types';

export const weatherService = {
	async getCurrentWeather(
		lat: number = 35.2271,
		lon: number = -80.8431
	): Promise<WeatherData> {
		const response = await api.get<WeatherData>('/api/weather/current', {
			params: { lat, lon },
		});
		return response.data;
	},
};
