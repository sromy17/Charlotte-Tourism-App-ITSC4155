import { create } from 'zustand';
import { RecommendationItemAPI, RecommendationsResponse } from '../services/api';

export interface ItineraryNode {
  id: string;
  title: string;
  location: string;
  cost: string;
  driveTime: string;
  description: string;
  time: string;
  lane: 'active' | 'discovery';
  status: 'queued' | 'active' | 'completed';
}

export interface WeatherSnapshot {
  current_temp?: number;
  description?: string;
  hourly?: Array<{ icon?: string }>;
}

export interface RecommendationItem {
  id: string;
  name: string;
  description: string;
  datetime?: string | null;
  location: string;
  price?: string | null;
  image?: string | null;
  type: string;
  source: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface PlannerRecommendationsResponse {
  category: string;
  date: string;
  budget: number;
  events: RecommendationItem[];
  restaurants: RecommendationItem[];
  activities: RecommendationItem[];
}

interface ExperienceStore {
  activeTaskId: string | null;
  itineraryNodes: ItineraryNode[];
  recommendations: PlannerRecommendationsResponse | null;
  apiRecommendations: RecommendationsResponse | null;
  selectedPlaces: RecommendationItemAPI[];
  loading: boolean;
  error: string | null;
  noResultsMessage: string | null;
  weather: WeatherSnapshot | null;
  setNodes: (nodes: ItineraryNode[]) => void;
  setRecommendations: (recommendations: PlannerRecommendationsResponse | null) => void;
  setApiRecommendations: (recommendations: RecommendationsResponse | null) => void;
  setSelectedPlaces: (places: RecommendationItemAPI[]) => void;
  addSelectedPlace: (place: RecommendationItemAPI) => void;
  removeSelectedPlace: (id: string) => void;
  reorderSelectedPlaces: (places: RecommendationItemAPI[]) => void;
  hydrateFromRecommendations: (response: PlannerRecommendationsResponse) => void;
  setActiveTask: (taskId: string | null) => void;
  completeTask: (taskId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setNoResultsMessage: (message: string | null) => void;
  setWeather: (weather: WeatherSnapshot | null) => void;
}

const emptyApiRecommendations: RecommendationsResponse = {
  restaurants: [],
  activities: [],
  events: [],
  vibe: '',
  weather: {
    is_rainy: false,
    rain_probability: 0,
    conditions: [],
  },
};

export const useExperienceStore = create<ExperienceStore>((set) => ({
  activeTaskId: null,
  itineraryNodes: [],
  recommendations: null,
  apiRecommendations: emptyApiRecommendations,
  selectedPlaces: [],
  loading: false,
  error: null,
  noResultsMessage: null,
  weather: null,

  setNodes: (nodes) => set({ itineraryNodes: nodes }),
  setRecommendations: (recommendations) => set({ recommendations }),
  setApiRecommendations: (recommendations) => set({ apiRecommendations: recommendations }),
  setSelectedPlaces: (selectedPlaces) => set({ selectedPlaces }),
  
    addSelectedPlace: (place) =>
    set((state) => {
      console.log("📍 STORE ATTEMPTING TO ADD:", place.name);
      console.log("📍 DATA RECEIVED:", { 
        lat: (place as any).latitude, 
        lng: (place as any).longitude,
        full_object: place 
      });

      const exists = state.selectedPlaces.some((item) => item.id === place.id);
      
      if (exists) {
        console.warn("⚠️ Place already in itinerary");
        return state;
      }

      return {
        selectedPlaces: [...state.selectedPlaces, place],
      };
    }),

  removeSelectedPlace: (id) =>
    set((state) => ({
      selectedPlaces: state.selectedPlaces.filter((item) => item.id !== id),
    })),

  reorderSelectedPlaces: (selectedPlaces) => set({ selectedPlaces }),

  // THE FIX IS HERE
  hydrateFromRecommendations: (response) => {
    // Helper to flatten coordinates so Itinerary.tsx can see them easily
    const mapWithCoords = (item: any, defaultSource: string) => ({
      ...item,
      // PUT THEM AT TOP LEVEL
      latitude: item.latitude || item.coordinates?.latitude || 35.2271,
      longitude: item.longitude || item.coordinates?.longitude || -80.8431,
      // KEEP THEM IN NESTED OBJECT FOR COMPATIBILITY
      coordinates: {
        latitude: item.latitude || item.coordinates?.latitude || 35.2271,
        longitude: item.longitude || item.coordinates?.longitude || -80.8431,
      },
      api_source: item.source || defaultSource,
      match_score: 95
    });

    const mappedRestaurants = response.restaurants.map(r => mapWithCoords(r, 'tomtom'));
    const mappedActivities = response.activities.map(a => mapWithCoords(a, 'tomtom'));
    const mappedEvents = response.events.map(e => mapWithCoords(e, 'ticketmaster'));

    const totalCount = mappedRestaurants.length + mappedActivities.length + mappedEvents.length;

    set({
      recommendations: response,
      apiRecommendations: {
        restaurants: mappedRestaurants,
        activities: mappedActivities,
        events: mappedEvents,
        vibe: response.category,
        weather: { is_rainy: false, rain_probability: 0, conditions: [] }
      },
      itineraryNodes: [], 
      activeTaskId: null,
      noResultsMessage:
        totalCount === 0
          ? 'No recommendations matched your criteria.'
          : null,
    });
  },

  setActiveTask: (taskId) => set({ activeTaskId: taskId }),
  completeTask: (taskId) =>
    set((state) => ({
      itineraryNodes: state.itineraryNodes.map((node) =>
        node.id === taskId ? { ...node, status: 'completed' } : node,
      ),
      activeTaskId: state.activeTaskId === taskId ? null : state.activeTaskId,
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setNoResultsMessage: (message) => set({ noResultsMessage: message }),
  setWeather: (weather) => set({ weather }),
}));