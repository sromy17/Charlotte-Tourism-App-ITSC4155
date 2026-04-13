import api from './api';
import { SelectionPayload } from '../state/experienceMachine';
import { PlannerRecommendationsResponse, WeatherSnapshot } from '../state/experienceStore';

const getTripLengthDays = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return 1;

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const difference = end.getTime() - start.getTime();

  return Math.max(1, Math.round(difference / 86400000) + 1);
};

const toAttractionsPayload = (selection: SelectionPayload) => ({
  category: selection.category,
  date: selection.arrival,
  budget: selection.budget,
  start_date: selection.arrival,
  end_date: selection.endDate,
  persona: selection.persona,
  hours: selection.hours,
  protocol: selection.protocol,
  preferences: {
    date_range_days: getTripLengthDays(selection.arrival, selection.endDate),
  },
});

export const experienceService = {
  async generateRecommendations(selection: SelectionPayload): Promise<PlannerRecommendationsResponse> {
    const response = await api.post<PlannerRecommendationsResponse>('/api/attractions/recommendations', toAttractionsPayload(selection));
    return response.data;
  },

  async getForecast(): Promise<WeatherSnapshot> {
    const response = await api.get<WeatherSnapshot>('/api/weather/forecast');
    return response.data;
  },
};
