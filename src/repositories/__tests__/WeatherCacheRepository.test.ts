import { describe, expect, it } from 'vitest';

import { WeatherCacheRepository } from '../WeatherCacheRepository';
import type { KeyValueStorage } from '../LocalStorageService';
import type { WeatherForecast } from '../../types';

class MemoryStorage implements KeyValueStorage {
  private values = new Map<string, string>();

  async getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  async setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  async removeItem(key: string) {
    this.values.delete(key);
  }
}

const forecast: WeatherForecast = {
  cityName: 'Alicante',
  country: 'Spain',
  latitude: 38.3452,
  longitude: -0.481,
  timezone: 'Europe/Madrid',
  currentConditionLabel: 'Rain',
  rainExpectedToday: true,
  rainExpectedLaterToday: true,
  updatedAt: '2026-05-14T09:00:00.000Z',
};

describe('WeatherCacheRepository', () => {
  it('returns cached weather while it is fresh', async () => {
    const repo = new WeatherCacheRepository('weather-cache', new MemoryStorage());
    await repo.save(forecast);

    expect(await repo.getFresh(new Date('2026-05-14T09:29:00.000Z'), 30)).toEqual(forecast);
  });

  it('keeps stale cache available as fallback', async () => {
    const repo = new WeatherCacheRepository('weather-cache', new MemoryStorage());
    await repo.save(forecast);

    expect(await repo.getFresh(new Date('2026-05-14T10:31:00.000Z'), 30)).toBeNull();
    expect(await repo.get()).toEqual(forecast);
  });
});
