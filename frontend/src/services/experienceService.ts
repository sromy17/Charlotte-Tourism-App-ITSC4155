import api from './api';
import { SelectionPayload } from '../state/experienceMachine';
import { SuggestionPayload, WeatherSnapshot } from '../state/experienceStore';

const toAttractionsPayload = (selection: SelectionPayload) => ({
  query: '',
  date: selection.arrival,
  persona: selection.persona,
  budget: selection.budget,
  hours: selection.hours,
  protocol: selection.protocol,
});

export const experienceService = {
  async generateSuggestions(selection: SelectionPayload): Promise<SuggestionPayload[]> {
    const response = await api.post<SuggestionPayload[]>('/api/attractions/generate', toAttractionsPayload(selection));
    return response.data;
  },

  async getForecast(): Promise<WeatherSnapshot> {
    const response = await api.get<WeatherSnapshot>('/api/weather/forecast');
    return response.data;
  },
};
