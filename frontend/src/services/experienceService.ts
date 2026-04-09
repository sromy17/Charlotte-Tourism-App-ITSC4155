import api from './api';
import { SelectionPayload } from '../state/experienceMachine';
import { SuggestionPayload, WeatherSnapshot } from '../state/experienceStore';

const getTripLengthDays = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return 1;

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const difference = end.getTime() - start.getTime();

  return Math.max(1, Math.round(difference / 86400000) + 1);
};

const toAttractionsPayload = (selection: SelectionPayload) => ({
  query: '',
  date: selection.arrival,
  start_date: selection.arrival,
  end_date: selection.endDate,
  date_range_days: getTripLengthDays(selection.arrival, selection.endDate),
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
