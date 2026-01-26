export interface WeatherData {
	temperature: number;
	feels_like: number;
	humidity: number;
	description: string;
	icon: string;
	is_risky_for_outdoor: boolean;
	risk_reason?: string | null;
}

export interface Attraction {
	id: string;
	name: string;
	rating: number;
	price: string;
	image_url: string;
	is_open: boolean;
	coordinates: {
		latitude: number;
		longitude: number;
	};
}

export interface Activity {
	id: number;
	name: string;
	type: 'indoor' | 'outdoor';
	time: string;
	coordinates: {
		latitude: number;
		longitude: number;
	};
}

export interface Itinerary {
	id: number;
	name: string;
	date: string;
	activities: Activity[];
}
