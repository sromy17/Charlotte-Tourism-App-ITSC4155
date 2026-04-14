import { create } from 'zustand';
import { RecommendationsResponse } from '../services/api';

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
  // New: Store the API response directly for component consumption
  apiRecommendations: RecommendationsResponse | null;
  loading: boolean;
  error: string | null;
  noResultsMessage: string | null;
  weather: WeatherSnapshot | null;
  setNodes: (nodes: ItineraryNode[]) => void;
  setRecommendations: (recommendations: PlannerRecommendationsResponse | null) => void;
  setApiRecommendations: (recommendations: RecommendationsResponse | null) => void;
  hydrateFromRecommendations: (response: PlannerRecommendationsResponse) => void;
  setActiveTask: (taskId: string | null) => void;
  completeTask: (taskId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setNoResultsMessage: (message: string | null) => void;
  setWeather: (weather: WeatherSnapshot | null) => void;
}

const seedNodes: ItineraryNode[] = [
  {
    id: 'node-1',
    title: 'Morning Stroll at Romare Bearden Park',
    location: 'Romare Bearden Park',
    cost: '$',
    driveTime: '10 min',
    description: 'A relaxed and scenic start in the heart of Uptown.',
    time: '09:00',
    lane: 'active',
    status: 'active',
  },
  {
    id: 'node-2',
    title: 'Late Morning at The Mint Museum',
    location: 'The Mint Museum',
    cost: '$$',
    driveTime: '14 min',
    description: 'Beautiful galleries and calm pace before lunch.',
    time: '11:15',
    lane: 'active',
    status: 'queued',
  },
  {
    id: 'node-3',
    title: 'South End Café & Gallery Walk',
    location: 'South End',
    cost: '$$',
    driveTime: '12 min',
    description: 'Casual discoveries with great coffee and local design.',
    time: '14:00',
    lane: 'discovery',
    status: 'queued',
  },
  {
    id: 'node-4',
    title: 'Evening in NoDa',
    location: 'NoDa Arts District',
    cost: '$$',
    driveTime: '18 min',
    description: 'A vibrant close to the day with music and atmosphere.',
    time: '19:30',
    lane: 'discovery',
    status: 'queued',
  },
];

export const useExperienceStore = create<ExperienceStore>((set) => ({
  activeTaskId: 'node-1',
  itineraryNodes: seedNodes,
  recommendations: null,
  apiRecommendations: null,
  loading: false,
  error: null,
  noResultsMessage: null,
  weather: null,
  setNodes: (nodes) => set({ itineraryNodes: nodes }),
  setRecommendations: (recommendations) => set({ recommendations }),
  setApiRecommendations: (recommendations) => set({ apiRecommendations: recommendations }),
  hydrateFromRecommendations: (response) => {
    const prioritized = [...response.events, ...response.restaurants, ...response.activities];
    const mappedNodes: ItineraryNode[] = prioritized.slice(0, 12).map((item, index) => ({
      id: String(item.id),
      title: item.name,
      location: item.location,
      cost: item.price || 'Price unavailable',
      driveTime: 'ETA varies',
      description: item.description,
      time: item.datetime ? item.datetime.replace('T', ' ') : `${9 + index}:00`,
      lane: index < 6 ? 'active' : 'discovery',
      status: index === 0 ? 'active' : 'queued',
    }));

    set({
      recommendations: response,
      itineraryNodes: mappedNodes,
      activeTaskId: mappedNodes[0]?.id ?? null,
      noResultsMessage:
        prioritized.length === 0
          ? 'No recommendations matched your selected vibe, date, and budget. Try a wider budget or a nearby date.'
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
