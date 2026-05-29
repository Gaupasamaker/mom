import { weatherAlerts } from '../../data/mockData';

export const WeatherService = {
  async getTodayAlerts() {
    return weatherAlerts;
  },
};
