import { create } from 'zustand';

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

export interface SuggestionPayload {
  id: string;
  activity: string;
  location: string;
  drive_time: string;
  cost: string;
  description: string;
}

interface ExperienceStore {
  activeTaskId: string | null;
  itineraryNodes: ItineraryNode[];
  loading: boolean;
  error: string | null;
  weather: WeatherSnapshot | null;
  setNodes: (nodes: ItineraryNode[]) => void;
  hydrateFromSuggestions: (items: SuggestionPayload[]) => void;
  setActiveTask: (taskId: string | null) => void;
  completeTask: (taskId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
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
  loading: false,
  error: null,
  weather: null,
  setNodes: (nodes) => set({ itineraryNodes: nodes }),
  hydrateFromSuggestions: (items) => {
    const mappedNodes: ItineraryNode[] = items.slice(0, 10).map((item, index) => ({
      id: String(item.id),
      title: item.activity,
      location: item.location,
      cost: item.cost,
      driveTime: item.drive_time,
      description: item.description,
      time: `${9 + index}:00`,
      lane: index < 5 ? 'active' : 'discovery',
      status: index === 0 ? 'active' : 'queued',
    }));

    set({
      itineraryNodes: mappedNodes,
      activeTaskId: mappedNodes[0]?.id ?? null,
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
  setWeather: (weather) => set({ weather }),
}));
