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

export interface User {
	name: string;
	email: string;
	profilePicture?: string | null; // base64 data URL or remote URL
}

export type Interest = string;

export interface SavedItem {
	id: string;
	name: string;
}

export interface WeatherTolerance {
	avoidRain: boolean;
	avoidExtremeHeat: boolean;
}

export interface UserPreferences {
	interests: Interest[];
	indoorOutdoor: 'indoor' | 'outdoor' | 'no-preference';
	budgetAmount: number;
	radiusMiles: number;
	weatherTolerance: WeatherTolerance;
}

// Extend User with preferences and saved lists
export interface ProfileUser extends User {
	preferences: UserPreferences;
	savedEvents: SavedItem[];
	savedRestaurants: SavedItem[];
}
