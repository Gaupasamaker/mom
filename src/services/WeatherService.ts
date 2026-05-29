import type { AppLanguage, WeatherCity, WeatherForecast } from '../types';
import { WeatherCodeService } from './WeatherCodeService';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 9000;
const RAIN_PROBABILITY_THRESHOLD = 30;
const HIGH_WIND_KMH = 25;
const HOT_DAY_C = 30;
const COLD_DAY_C = 8;

type Fetcher = typeof fetch;

const toNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : undefined);
const firstNumber = (value: unknown) => (Array.isArray(value) ? toNumber(value[0]) : undefined);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const withTimeout = async (url: string, fetcher: Fetcher = fetch) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetcher(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Weather request failed with ${response.status}`);
    }

    return response.json() as Promise<unknown>;
  } finally {
    clearTimeout(timeout);
  }
};

const cityFromResult = (result: Record<string, unknown>): WeatherCity | null => {
  const id = result.id;
  const name = result.name;
  const latitude = result.latitude;
  const longitude = result.longitude;

  if (typeof name !== 'string' || typeof latitude !== 'number' || typeof longitude !== 'number') {
    return null;
  }

  return {
    id: String(id ?? `${name}-${latitude}-${longitude}`),
    name,
    country: typeof result.country === 'string' ? result.country : undefined,
    countryCode: typeof result.country_code === 'string' ? result.country_code : undefined,
    admin1: typeof result.admin1 === 'string' ? result.admin1 : undefined,
    latitude,
    longitude,
    timezone: typeof result.timezone === 'string' ? result.timezone : undefined,
  };
};

const weatherUnavailable = (city: WeatherCity, updatedAt: string, language: AppLanguage = 'en'): WeatherForecast => ({
  cityName: city.name,
  country: city.country,
  admin1: city.admin1,
  latitude: city.latitude,
  longitude: city.longitude,
  timezone: city.timezone,
  currentConditionLabel: WeatherCodeService.fromCode(undefined, language).label,
  currentConditionIcon: 'weather-cloudy-alert',
  rainExpectedToday: false,
  rainExpectedLaterToday: false,
  highWindExpectedToday: false,
  hotDayExpected: false,
  coldDayExpected: false,
  updatedAt,
  unavailable: true,
});

export const WeatherService = {
  async searchCities(query: string, fetcher?: Fetcher, language: AppLanguage = 'en'): Promise<WeatherCity[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return [];
    }

    const params = new URLSearchParams({
      name: trimmed,
      count: '8',
      language,
      format: 'json',
    });
    const payload = await withTimeout(`${GEOCODING_URL}?${params.toString()}`, fetcher);

    if (!isRecord(payload) || !Array.isArray(payload.results)) {
      return [];
    }

    return payload.results
      .filter(isRecord)
      .map(cityFromResult)
      .filter((city): city is WeatherCity => Boolean(city));
  },

  async fetchForecast(city: WeatherCity, fetcher?: Fetcher, language: AppLanguage = 'en'): Promise<WeatherForecast> {
    const params = new URLSearchParams({
      latitude: String(city.latitude),
      longitude: String(city.longitude),
      current: 'temperature_2m,weather_code',
      daily: 'temperature_2m_max,temperature_2m_min',
      hourly: 'precipitation_probability,precipitation,weather_code,wind_speed_10m',
      timezone: city.timezone ?? 'auto',
      forecast_days: '1',
    });
    const payload = await withTimeout(`${FORECAST_URL}?${params.toString()}`, fetcher);

    return this.normalizeForecast(city, payload, new Date().toISOString(), language);
  },

  normalizeForecast(city: WeatherCity, payload: unknown, updatedAt = new Date().toISOString(), language: AppLanguage = 'en'): WeatherForecast {
    if (!isRecord(payload)) {
      return weatherUnavailable(city, updatedAt, language);
    }

    const current = isRecord(payload.current) ? payload.current : {};
    const daily = isRecord(payload.daily) ? payload.daily : {};
    const hourly = isRecord(payload.hourly) ? payload.hourly : {};

    const currentTemperature = toNumber(current.temperature_2m);
    const currentConditionCode = toNumber(current.weather_code);
    const currentCondition = WeatherCodeService.fromCode(currentConditionCode, language);
    const dailyMaxTemperature = firstNumber(daily.temperature_2m_max);
    const dailyMinTemperature = firstNumber(daily.temperature_2m_min);

    const times = Array.isArray(hourly.time) ? hourly.time.filter((time): time is string => typeof time === 'string') : [];
    const precipitationProbabilities = Array.isArray(hourly.precipitation_probability) ? hourly.precipitation_probability.map(toNumber) : [];
    const precipitation = Array.isArray(hourly.precipitation) ? hourly.precipitation.map(toNumber) : [];
    const weatherCodes = Array.isArray(hourly.weather_code) ? hourly.weather_code.map(toNumber) : [];
    const windSpeeds = Array.isArray(hourly.wind_speed_10m) ? hourly.wind_speed_10m.map(toNumber) : [];

    const precipitationProbabilityMaxToday = precipitationProbabilities.reduce<number | undefined>(
      (max, value) => (typeof value === 'number' ? Math.max(max ?? value, value) : max),
      undefined,
    );
    const rainIndex = times.findIndex((_, index) => {
      const probability = precipitationProbabilities[index] ?? 0;
      const amount = precipitation[index] ?? 0;
      const code = weatherCodes[index];
      return probability >= RAIN_PROBABILITY_THRESHOLD || amount > 0 || WeatherCodeService.isRainCode(code);
    });
    const rainExpectedToday = rainIndex >= 0;
    const highWindExpectedToday = windSpeeds.some((speed) => typeof speed === 'number' && speed >= HIGH_WIND_KMH);
    const hasUsableCurrent = currentTemperature !== undefined || currentConditionCode !== undefined;

    if (!hasUsableCurrent && dailyMaxTemperature === undefined && dailyMinTemperature === undefined && times.length === 0) {
      return weatherUnavailable(city, updatedAt, language);
    }

    return {
      cityName: city.name,
      country: city.country,
      admin1: city.admin1,
      latitude: city.latitude,
      longitude: city.longitude,
      timezone: typeof payload.timezone === 'string' ? payload.timezone : city.timezone,
      currentTemperature,
      dailyMaxTemperature,
      dailyMinTemperature,
      currentConditionCode,
      currentConditionLabel: currentCondition.label,
      currentConditionIcon: currentCondition.icon,
      precipitationProbabilityMaxToday,
      rainExpectedToday,
      rainExpectedLaterToday: rainExpectedToday,
      nextRainTime: rainIndex >= 0 ? times[rainIndex] : undefined,
      highWindExpectedToday,
      hotDayExpected: typeof dailyMaxTemperature === 'number' ? dailyMaxTemperature >= HOT_DAY_C : false,
      coldDayExpected: typeof dailyMinTemperature === 'number' ? dailyMinTemperature <= COLD_DAY_C : false,
      updatedAt,
    };
  },
};
