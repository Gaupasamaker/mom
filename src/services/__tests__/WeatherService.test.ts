import { describe, expect, it } from 'vitest';

import { WeatherService } from '../WeatherService';
import type { WeatherCity } from '../../types';

const city: WeatherCity = {
  id: 'alicante-es',
  name: 'Alicante',
  country: 'Spain',
  admin1: 'Valencia',
  latitude: 38.3452,
  longitude: -0.481,
  timezone: 'Europe/Madrid',
};

describe('WeatherService', () => {
  it('normalizes an Open-Meteo forecast into app weather data', () => {
    const forecast = WeatherService.normalizeForecast(city, {
      latitude: 38.34,
      longitude: -0.48,
      timezone: 'Europe/Madrid',
      current: {
        temperature_2m: 24.4,
        weather_code: 61,
      },
      daily: {
        temperature_2m_max: [31.2],
        temperature_2m_min: [18.1],
      },
      hourly: {
        time: ['2026-05-14T08:00', '2026-05-14T14:00', '2026-05-14T20:00'],
        precipitation_probability: [5, 35, 80],
        precipitation: [0, 0, 2.4],
        weather_code: [3, 51, 61],
        wind_speed_10m: [10, 18, 28],
      },
    }, '2026-05-14T09:00:00.000Z');

    expect(forecast).toMatchObject({
      cityName: 'Alicante',
      country: 'Spain',
      currentTemperature: 24.4,
      currentConditionCode: 61,
      currentConditionLabel: 'Rain',
      dailyMaxTemperature: 31.2,
      dailyMinTemperature: 18.1,
      precipitationProbabilityMaxToday: 80,
      rainExpectedToday: true,
      rainExpectedLaterToday: true,
      nextRainTime: '2026-05-14T14:00',
      highWindExpectedToday: true,
      hotDayExpected: true,
      coldDayExpected: false,
    });
  });

  it('returns a safe unavailable forecast for malformed data', () => {
    const forecast = WeatherService.normalizeForecast(city, {}, '2026-05-14T09:00:00.000Z');

    expect(forecast).toMatchObject({
      cityName: 'Alicante',
      currentConditionLabel: 'Weather unavailable',
      rainExpectedToday: false,
      rainExpectedLaterToday: false,
    });
  });
});
