import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
	baseURL,
	headers: {
		'Content-Type': 'application/json',
	},
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem('token');
	if (token && token !== 'undefined' && config.headers) {
		config.headers['Authorization'] = `Bearer ${token}`;
	}
	return config;
});

// ========== RECOMMENDATIONS API ==========

export interface RecommendationItemAPI {
    id: string;
    name: string;
    type: string;
    api_source: string;
    description: string;
    location?: string;
    price?: string;
    image_url?: string;
    datetime?: string;
    match_score?: number;
    latitude?: number;
    longitude?: number;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

export interface RecommendationsResponse {
	restaurants: RecommendationItemAPI[];
	activities: RecommendationItemAPI[];
	events: RecommendationItemAPI[];
	vibe?: string;
	weather?: any;
	error?: string;
}

export interface SavedItineraryRequest {
	trip_name: string;
	user_id: number;
	saved_activities: {
		items: RecommendationItemAPI[];
		saved_at: string;
	};
}

export interface SavedItineraryResponse {
	id: number;
	trip_name: string;
	user_id: number;
	saved_activities: {
		items: RecommendationItemAPI[];
		saved_at: string;
	};
}

export const saveItinerary = async (
	payload: SavedItineraryRequest,
): Promise<SavedItineraryResponse> => {
	const response = await api.post('/api/itineraries/', payload);
	return response.data;
};

/**
 * Fetch recommendations from the backend
 * @param vibe - One of: food_and_culture, social_weekend, leisure_and_luxury, city_explorer
 * @param startDate - Start date in YYYY-MM-DD format
 * @param budget - Budget per item in USD (default: 150)
 * @param endDate - End date in YYYY-MM-DD format (optional, defaults to startDate)
 */
export const fetchRecommendations = async (
	vibe: string,
	startDate: string,
	budget: number = 150,
	endDate?: string
): Promise<RecommendationsResponse> => {
	try {
		const response = await api.get('/api/itineraries/recommendations/generate', {
			params: {
				vibe,
				start_date: startDate,
				budget,
				...(endDate && { end_date: endDate }),
			},
		});
		return response.data;
	} catch (error) {
		console.error('[API] Failed to fetch recommendations:', error);
		throw error;
	}
};

export const updateItinerary = async (
  id: number,
  payload: Partial<SavedItineraryRequest>
): Promise<SavedItineraryResponse> => {
  const response = await api.put(`/api/itineraries/${id}`, payload);
  return response.data;
};



export default api;
