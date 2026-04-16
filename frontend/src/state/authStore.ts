import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import api from '../services/api';
import { SelectionPayload } from './experienceMachine';
import { ItineraryNode, WeatherSnapshot } from './experienceStore';

export interface AuthUser {
  id?: string | number;
  name: string;
  email: string;
  [key: string]: unknown;
}

export interface ActiveItinerary {
  id: string;
  title: string;
  createdAt: string;
  selections?: Partial<SelectionPayload>;
  nodes?: ItineraryNode[];
  weather?: WeatherSnapshot | null;
  status?: 'draft' | 'active' | 'completed';
  [key: string]: unknown;
}

interface SignInResult {
  success: boolean;
  message: string;
}

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  activeItinerary: ActiveItinerary | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  setUser: (user: AuthUser | null) => void;
  setActiveItinerary: (itinerary: ActiveItinerary | null) => void;
  clearActiveItinerary: () => void;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => void;
  fetchCurrentUser: () => Promise<void>;
  fetchActiveItinerary: () => Promise<void>;
}

const buildDisplayName = (email: string) => {
  const localPart = email.split('@')[0] || 'guest';
  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      activeItinerary: null,
      token: null,
      loading: false,
      error: null,

      setUser: (user) => {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          localStorage.removeItem('user');
        }

        set({
          user,
          isAuthenticated: Boolean(user),
        });
      },

      setActiveItinerary: (itinerary) => set({ activeItinerary: itinerary }),

      clearActiveItinerary: () => set({ activeItinerary: null }),

      signIn: async (email, password) => {
        const normalizedEmail = email.trim().toLowerCase();
        set({ loading: true, error: null });

        try {
          const response = await api.post('/api/auth/login', {
            email: normalizedEmail,
            password,
          });

          const token = response.data?.token ?? null;
          const user: AuthUser = response.data?.user ?? {
            name: buildDisplayName(normalizedEmail),
            email: normalizedEmail,
          };

          if (token) {
            localStorage.setItem('token', token);
          } else {
            localStorage.removeItem('token');
          }
          localStorage.setItem('user', JSON.stringify(user));

          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
            error: null,
          });

          return {
            success: true,
            message: response.data?.message ?? 'Signed in successfully.',
          };
        } catch (error) {
          set({
            loading: false,
            error: error instanceof Error ? error.message : 'Login failed',
            isAuthenticated: false,
          });

          return {
            success: false,
            message: error instanceof Error ? error.message : 'Login failed. Please check your email and password.',
          };
        }
      },

      signOut: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          activeItinerary: null,
          error: null,
        });
      },

      fetchCurrentUser: async () => {
        set({ loading: true, error: null });

        try {
          // Placeholder endpoint for backend merge.
          const response = await api.get('/api/auth/me');
          const user = response.data?.user ?? response.data ?? null;

          set({
            user,
            isAuthenticated: Boolean(user),
            loading: false,
          });
        } catch {
          set({
            loading: false,
            error: 'Unable to load the current user yet.',
          });
        }
      },

      fetchActiveItinerary: async () => {
        set({ loading: true, error: null });

        try {
          const user = JSON.parse(localStorage.getItem('user') || 'null');
          if (!user?.id) {
            set({
              activeItinerary: null,
              loading: false,
              error: 'No signed-in user available to load itinerary.',
            });
            return;
          }

          const response = await api.get(`/api/itineraries/${user.id}`);
          const itineraries = response.data ?? [];
          const itinerary = Array.isArray(itineraries) ? itineraries[0] ?? null : itineraries;

          set({
            activeItinerary: itinerary,
            loading: false,
          });
        } catch {
          set({
            loading: false,
            error: 'Unable to load the active itinerary yet.',
          });
        }
      },
    }),
    {
      name: 'cltourism-auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ user, isAuthenticated, activeItinerary, token }) => ({
        user,
        isAuthenticated,
        activeItinerary,
        token,
      }),
    },
  ),
);
